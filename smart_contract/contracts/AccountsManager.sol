// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AccountsManager is AccessControl {
    bytes32 constant PATIENT_ROLE = "PATIENT_ROLE";
    bytes32 constant DOCTOR_ROLE = "DOCTOR_ROLE";
    bytes32 constant REGISTERED_USER_ROLE = "REGISTERED_USER_ROLE";


    /// @dev Add msg.sender as a member of the root role.
    constructor () {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PATIENT_ROLE, msg.sender);
        _setupRole(DOCTOR_ROLE, msg.sender);
        _setupRole(REGISTERED_USER_ROLE, msg.sender);
    }


    function registerDoctor(address doctorAddress) public onlyMember(DEFAULT_ADMIN_ROLE){
        grantRole(DOCTOR_ROLE, doctorAddress);
        grantRole(REGISTERED_USER_ROLE, doctorAddress);
    }

    function revokeDoctor(address doctorAddress) public onlyMember(DEFAULT_ADMIN_ROLE){
        revokeRole(DOCTOR_ROLE, doctorAddress);
        revokeRole(REGISTERED_USER_ROLE, doctorAddress);
    }

    function registerNewPatient(address patientAddress) public onlyMember(DOCTOR_ROLE){
        _grantRole(PATIENT_ROLE, patientAddress);
        _grantRole(REGISTERED_USER_ROLE, patientAddress);
    }

    function revokePatient(address patientAddress) public onlyMember(DOCTOR_ROLE){
        _revokeRole(PATIENT_ROLE, patientAddress);
        _revokeRole(REGISTERED_USER_ROLE, patientAddress);
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