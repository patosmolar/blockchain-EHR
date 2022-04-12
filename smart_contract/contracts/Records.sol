// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./AccountsManager.sol";

contract MedicalRecords {

    bytes32 constant GRANTER_ROLE = sha256("GRANTER_ROLE");

    bytes32 constant PATIEN_ROLE = sha256("PATIEN_ROLE");
    bytes32 constant PRIMARY_CARE_DOCTOR_ROLE = sha256("PRIMARY_CARE_DOCTOR_ROLE");
    bytes32 constant ALERGIST_ROLE = sha256("ALERGIST_ROLE");
    AccountsManager accountsManager;

    constructor (address accoutnsManagerContractAddress) {
        accountsManager = AccountsManager(accoutnsManagerContractAddress);
    }
    struct MedicalRecord{
        string fileHash;
        string ownerKey;
        string tempKey;
        address tempKeyOwner;
    }

    mapping(address => MedicalRecord) private records;
    mapping(address => string) private publicKeys;

    function registerDevice(string memory publicKey) public onlyMember(GRANTER_ROLE) {
        publicKeys[msg.sender] = publicKey;
    }

    function addMedicalRecord(address patientAddress, string memory fileHash, string memory key, address owner) public onlyMember(PRIMARY_CARE_DOCTOR_ROLE){
        records[patientAddress] = MedicalRecord(fileHash, owner, key);
    }

    function changeRecordOwnership(address patietPublicAddress, address newOwner, string memory newKey) public{
        records[patietPublicAddress].key = newKey;
        records[patietPublicAddress].keyOwner = newOwner;
    }



    /// @dev Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(accountsManager.isMemberOf(roleId, msg.sender), "Restricted to members.");
        _;
    }
}