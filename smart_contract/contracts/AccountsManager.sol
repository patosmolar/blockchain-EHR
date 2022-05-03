// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AccountsManager is AccessControl {
    bytes32 constant PATIENT_ROLE = "PATIENT_ROLE";
    bytes32 constant DOCTOR_ROLE = "DOCTOR_ROLE";
    bytes32 constant REGISTERED_USER_ROLE = "REGISTERED_USER_ROLE";

    struct Registration{
        string publicKey;
        string privateKey;
        bool isValue;
    }

    mapping(address => Registration) private credentials;

    /// @dev Add msg.sender as a member of the root role.
    constructor () {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PATIENT_ROLE, msg.sender);
        _setupRole(DOCTOR_ROLE, msg.sender);
        _setupRole(REGISTERED_USER_ROLE, msg.sender);
        credentials[msg.sender] = Registration("{}", "{}", true);
    }

    function getPublicKey(address addr) public view returns(string memory){
        return credentials[addr].publicKey;
    }

    function getPrivateKey() public view returns(string memory){
        return credentials[msg.sender].privateKey;
    }

    function isAccountRegistered(address addr) public view returns(bool){
        return credentials[addr].isValue;
    }

    function registerDoctor(address doctorAddress, string memory publicKey, string memory privateKey) public onlyMember(DEFAULT_ADMIN_ROLE){
        require(credentials[doctorAddress].isValue == false, "Doctor alredy registered");
        grantRole(DOCTOR_ROLE, doctorAddress);
        grantRole(REGISTERED_USER_ROLE, doctorAddress);
        credentials[doctorAddress] = Registration(publicKey, privateKey, true);
    }

    function revokeDoctor(address doctorAddress) public onlyMember(DEFAULT_ADMIN_ROLE){
        require(credentials[doctorAddress].isValue == true, "Doctor not registered");
        revokeRole(DOCTOR_ROLE, doctorAddress);
        revokeRole(REGISTERED_USER_ROLE, doctorAddress);
        delete credentials[doctorAddress];
    }

    function registerNewPatient(address patientAddress, string memory publicKey, string memory privateKey) public onlyMember(DOCTOR_ROLE){
        require(credentials[patientAddress].isValue == false, "Patient alredy registered");
        _grantRole(PATIENT_ROLE, patientAddress);
        _grantRole(REGISTERED_USER_ROLE, patientAddress);
        credentials[patientAddress] = Registration(publicKey, privateKey, true);
    }

    function revokePatient(address patientAddress) public onlyMember(DOCTOR_ROLE){
        require(credentials[patientAddress].isValue == true, "Patient not registered");
        _revokeRole(PATIENT_ROLE, patientAddress);
        _revokeRole(REGISTERED_USER_ROLE, patientAddress);
        delete credentials[patientAddress];
    }

    function isDoctorRegistered(address doctorAddr) public view returns (bool){
            return hasRole(DOCTOR_ROLE, doctorAddr);
    }

    function isPatientRegistered(address patientAddress) public view returns (bool){
            return hasRole(PATIENT_ROLE, patientAddress);
    }

    function isAdmin() public onlyMember(DEFAULT_ADMIN_ROLE) view returns(bool){
        return true;
    }

    function isMemberOf(bytes32 roleId, address ad) public view returns(bool){
        return hasRole(roleId, ad);
    }

    /// @dev Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(hasRole(roleId, msg.sender), "Restricted to members.");
        _;
    }
}