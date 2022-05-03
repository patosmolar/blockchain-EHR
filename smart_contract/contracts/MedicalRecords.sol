// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./AccountsManager.sol";

contract MedicalRecords {
    bytes32 constant PATIEN_ROLE = "PATIEN_ROLE";
    bytes32 constant DOCTOR_ROLE = "DOCTOR_ROLE";
    bytes32 constant REGISTERED_USER_ROLE = "REGISTERED_USER_ROLE";

    AccountsManager accountsManager;

    constructor (address accoutnsManagerContractAddress) {
        accountsManager = AccountsManager(accoutnsManagerContractAddress);
        
    }

    struct MedicalRecord{
        string mainFileHash;
        string patientAccessFileHash;
        address mainFileCurrentOwner;
        bool isEditable;
        bool isValue;
    }

    mapping(address => MedicalRecord) private records;

    

    function medicalFolderExists(address patientAddress) public onlyMember(REGISTERED_USER_ROLE) view returns(bool){
        return records[patientAddress].isValue;
    } 

    function addMedicalFolder(address patientAddress, 
                              string memory mainFileHash,
                              string memory patientAccessFileHash,
                              address mainFileHashOwner) public onlyMember(DOCTOR_ROLE){
        require(records[patientAddress].isValue == false, "User alredy posses medical folder");
        records[patientAddress] = MedicalRecord(mainFileHash, patientAccessFileHash, mainFileHashOwner, true, true);
    }

    // function to easiely get doctors fileHash, 
    //be aware that all data is accesible publicly, this is not protection at any level
    function getMediacalRecordDoctor(address patientAddress) public onlyMember(DOCTOR_ROLE) view returns(string memory){
        require(records[patientAddress].mainFileCurrentOwner == msg.sender, "Unauthorized");
        return records[patientAddress].mainFileHash;
    }
    
    // function to easiely get patients fileHash, 
    //be aware that all data is accesible publicly, this is not protection at any level
    function getMediacalRecordPatient() public view returns(string memory){
        return records[msg.sender].patientAccessFileHash;
    }

    function updateMedicalRecord(address patientAddress, 
                              string memory mainFileHash,
                              string memory patientAccessFileHash,
                              address mainFileOwner) public onlyMember(DOCTOR_ROLE) {
        require(records[patientAddress].mainFileCurrentOwner == msg.sender, "Not mainFile owner");
        require(records[patientAddress].isEditable == true, "Folder not editable");
        records[patientAddress].mainFileHash = mainFileHash;
        records[patientAddress].patientAccessFileHash = patientAccessFileHash;
        records[patientAddress].mainFileCurrentOwner = mainFileOwner;
    }

    function deleteMedicalFolder(address patientAddress) public onlyMember(DOCTOR_ROLE) {
        require(records[patientAddress].mainFileCurrentOwner == msg.sender, "Not mainFile owner");
        require(records[patientAddress].isEditable == true, "Folder not editable");
        delete records[patientAddress];
    }   

    function getFolderEditState(address patientAddress) public onlyMember(REGISTERED_USER_ROLE) view returns(bool){
        return records[patientAddress].isEditable;
    }

    function denyFolderEdit() public onlyMember(REGISTERED_USER_ROLE){
        records[msg.sender].isEditable = false;
    }

    function allowFolderEdit() public onlyMember(REGISTERED_USER_ROLE){
        records[msg.sender].isEditable = true;
    }


    modifier onlyMainFileOwner(address patietPublicAddress){
        require(msg.sender == records[patietPublicAddress].mainFileCurrentOwner);
        _;
    }

    /// @dev Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(accountsManager.isMemberOf(roleId, msg.sender), "Restricted to members.");
        _;
    }
}