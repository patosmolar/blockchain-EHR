// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./AccountsManager.sol";

/// @title Medical Records
/// @author Patrik Smolar.
/// @notice Management of medical records.
/// @dev Needs previous deployment of AccountManager.sol.
contract MedicalRecords {
    /// @notice Main object to hold data for patients medical records.
    /// @dev File hash params store hash of files sotred in IPFS.
    /// @dev mainFileCurrentOwner is addres of owner of mainFileHash.
    /// @dev isEditable switch to allow/deny editing.
    struct MedicalFolder {
        string mainFileHash;
        string patientAccessFileHash;
        address mainFileCurrentOwner;
        bool isEditable;
        bool isValue;
    }

    /// @notice AccountsManager contract.
    /// @dev Reference to AccountsManager smart contract ininialized in constructor.
    AccountsManager accountsManager;

    /// @notice Main storage for MedicalFolder.
    /// @dev mapping for MedicalFolder, key -> address of patient, value -> MedicalFolder object.
    mapping(address => MedicalFolder) private records;

    /// @notice Constructor.
    /// @dev Constructor initializes AccountsManager contract reference.
    /// @param accoutnsManagerContractAddress address of deployed AccountsManager contract.
    constructor(address accoutnsManagerContractAddress) {
        accountsManager = AccountsManager(accoutnsManagerContractAddress);
    }

    /// @notice Add new medical folder for patient.
    /// @dev Creates new entry in records mapping.
    /// @param patientAddress Addres of patient to create medical folder.
    /// @param mainFileHash Hash of main file stored in IPFS.
    /// @param patientAccessFileHash Hash of patients file stored in IPFS.
    /// @param mainFileHashOwner Addres of account who can decrypt mainFile.
    function addMedicalFolder(
        address patientAddress,
        string memory mainFileHash,
        string memory patientAccessFileHash,
        address mainFileHashOwner
    ) public onlyMember(accountsManager.DOCTOR_ROLE()) {
        require(
            records[patientAddress].isValue == false,
            "User alredy posses medical folder"
        );
        records[patientAddress] = MedicalFolder(
            mainFileHash,
            patientAccessFileHash,
            mainFileHashOwner,
            true,
            true
        );
    }

    /// @notice Updates patients medical folder.
    /// @dev Upddate records[patientAddress] data.
    /// @dev If sender not mainFileCurrentOwner, returns "Not mainFile owner".
    /// @dev If patient sets isEditable to true, returns "Folder not editable"
    /// @param patientAddress Addres of patient to create medical folder.
    /// @param mainFileHash Hash of main file stored in IPFS.
    /// @param patientAccessFileHash Hash of patients file stored in IPFS.
    /// @param mainFileOwner Addres of account who can decrypt mainFile.
    function updateMedicalFolder(
        address patientAddress,
        string memory mainFileHash,
        string memory patientAccessFileHash,
        address mainFileOwner
    ) public onlyMember(accountsManager.DOCTOR_ROLE()) {
        require(
            records[patientAddress].mainFileCurrentOwner == msg.sender,
            "Not mainFile owner"
        );
        require(
            records[patientAddress].isEditable == true,
            "Folder not editable"
        );
        records[patientAddress].mainFileHash = mainFileHash;
        records[patientAddress].patientAccessFileHash = patientAccessFileHash;
        records[patientAddress].mainFileCurrentOwner = mainFileOwner;
    }

    /// @notice Delete patients medical folder.
    /// @dev Deletes records[patientAddress];
    /// @dev If sender not mainFileCurrentOwner, returns "Not mainFile owner".
    /// @dev If patient sets isEditable to true, returns "Folder not editable"
    /// @param patientAddress Addres of patient to delete medical folder.
    function deleteMedicalFolder(address patientAddress)
        public
        onlyMember(accountsManager.DOCTOR_ROLE())
    {
        require(
            records[patientAddress].mainFileCurrentOwner == msg.sender,
            "Not mainFile owner"
        );
        require(
            records[patientAddress].isEditable == true,
            "Folder not editable"
        );
        delete records[patientAddress];
    }

    /// @notice Deny patients doler editation.
    /// @dev Sets isEditable to false.
    function denyFolderEdit()
        public
        onlyMember(accountsManager.REGISTERED_USER_ROLE())
    {
        records[msg.sender].isEditable = false;
    }

    /// @notice Deny patients doler editation.
    /// @dev Sets isEditable to false.
    function allowFolderEdit()
        public
        onlyMember(accountsManager.REGISTERED_USER_ROLE())
    {
        records[msg.sender].isEditable = true;
    }

    /// @notice Function to retreive mainFileHas from patients folder.
    /// @dev If sender not mainFileCurrentOwner, returns "Unauthorized".
    /// @param patientAddress Addres of account to retreive fileHash.
    /// @return String maiFileHash from patients folder.
    function getMediacalRecordDoctor(address patientAddress)
        public
        view
        onlyMember(accountsManager.DOCTOR_ROLE())
        returns (string memory)
    {
        require(
            records[patientAddress].mainFileCurrentOwner == msg.sender,
            "Unauthorized"
        );
        return records[patientAddress].mainFileHash;
    }

    /// @notice Function to retreive patientFileHash from patients folder.
    /// @dev Returns msg.sender's patientAccessFileHash,
    /// @return String maiFileHash from patients folder.
    function getMediacalRecordPatient() public view returns (string memory) {
        return records[msg.sender].patientAccessFileHash;
    }

    /// @notice Checker if patient has saved medical folder.
    /// @dev Checks isValue from records[patientAddress], which is set to true in Records constructor.
    /// @param patientAddress Address of account to check folder exitence.
    /// @return True if exists, false otherwise
    function medicalFolderExists(address patientAddress)
        public
        view
        onlyMember(accountsManager.REGISTERED_USER_ROLE())
        returns (bool)
    {
        return records[patientAddress].isValue;
    }

    /// @notice Function to get Editable state of folder.
    /// @dev returns records[patientAddress].isEditable.
    /// @param patientAddress Address of account to check folder's edit status exitence.
    /// @return True if editable, false otherwise
    function getFolderEditState(address patientAddress)
        public
        view
        onlyMember(accountsManager.REGISTERED_USER_ROLE())
        returns (bool)
    {
        return records[patientAddress].isEditable;
    }

    /// @dev Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(
            accountsManager.isMemberOf(roleId, msg.sender),
            "Restricted to members."
        );
        _;
    }
}
