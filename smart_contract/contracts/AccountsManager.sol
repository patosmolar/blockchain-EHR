// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AccountsManager is AccessControl {
    bytes32 constant GRANTER_ROLE = sha256("GRANTER_ROLE");

    bytes32 constant PATIEN_ROLE = sha256("PATIEN_ROLE");
    bytes32 constant PRIMARY_CARE_DOCTOR_ROLE = sha256("PRIMARY_CARE_DOCTOR_ROLE");
    bytes32 constant ALERGIST_ROLE = sha256("ALERGIST_ROLE");


    /// @dev Add msg.sender as a member of the root role.
    constructor () {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(GRANTER_ROLE, msg.sender);
        _setupRole(PATIEN_ROLE, msg.sender);
        _setupRole(PRIMARY_CARE_DOCTOR_ROLE, msg.sender);
        _setupRole(ALERGIST_ROLE, msg.sender);
    }


    function registerDoctor(address doctorAddress) public onlyMember(DEFAULT_ADMIN_ROLE){
        grantRole(GRANTER_ROLE, doctorAddress);
        grantRole(PRIMARY_CARE_DOCTOR_ROLE, doctorAddress);
    }

    function registerNewPatient(address patientAddress) public onlyMember(GRANTER_ROLE){
        grantRole(PATIEN_ROLE, patientAddress);
        grantRole(GRANTER_ROLE, patientAddress);
    }

    function isPatientRegistered(address patientAddress) public view returns (bool){
            return hasRole(PATIEN_ROLE, patientAddress);
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