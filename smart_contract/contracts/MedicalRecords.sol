// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./AccountsManager.sol";

contract MedicalRecords {
    bytes32 constant PATIEN_ROLE = sha256("PATIEN_ROLE");
    bytes32 constant DOCTOR_ROLE = sha256("DOCTOR_ROLE");
    bytes32 constant REGISTERED_USER_ROLE = sha256("REGISTERED_USER_ROLE");

    AccountsManager accountsManager;

    constructor (address accoutnsManagerContractAddress) {
        accountsManager = AccountsManager(accoutnsManagerContractAddress);
    }
    struct MedicalRecord{
        string mainFileHash;
        string patientAccessFileHash;
        address mainFileCurrentOwner;
    }

    mapping(address => MedicalRecord) private records;
    mapping(address => string) private publicKeys;

    function registerDevice(string memory publicKey) public onlyMember(REGISTERED_USER_ROLE) {
        publicKeys[msg.sender] = publicKey;
    }

    function addMedicalRecord(address patientAddress, 
                              string memory mainFileHash,
                              string memory patientAccessFileHash,
                              address mainFileHashOwner) public onlyMember(DOCTOR_ROLE) {
        records[patientAddress] = MedicalRecord(mainFileHash, patientAccessFileHash, mainFileHashOwner);
    }
    
    function getMediacalRecordPatient() public view returns(string memory){
        return records[msg.sender].patientAccessFileHash;
    }

    function getMediacalRecordDoctor(address patientAddress) public view returns(string memory){
        if(records[patientAddress].mainFileCurrentOwner != msg.sender){
            return "Unauthorized";
        }
        return records[patientAddress].mainFileHash;
    }

    function changeMainFileOwnership(address patientPublicAddress, 
                                     address newOwner,
                                     string memory newFileHash) public onlyMainFileOwner(patientPublicAddress){
        records[patientPublicAddress].mainFileHash = newFileHash;
        records[patientPublicAddress].mainFileCurrentOwner = newOwner;
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