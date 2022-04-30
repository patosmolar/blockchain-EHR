// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AccountsManager is AccessControl {
    bytes32 constant PATIEN_ROLE = "PATIEN_ROLE";
    bytes32 constant DOCTOR_ROLE = "DOCTOR_ROLE";
    bytes32 constant REGISTERED_USER_ROLE = "REGISTERED_USER_ROLE";


    /// @dev Add msg.sender as a member of the root role.
    constructor () {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PATIEN_ROLE, msg.sender);
        _setupRole(DOCTOR_ROLE, msg.sender);
        _setupRole(REGISTERED_USER_ROLE, msg.sender);
    }


    function registerDoctor(address doctorAddress) public onlyMember(DEFAULT_ADMIN_ROLE){
        grantRole(DOCTOR_ROLE, doctorAddress);
        grantRole(REGISTERED_USER_ROLE, doctorAddress);
    }

    function registerNewPatient(address patientAddress) public onlyMember(DOCTOR_ROLE){
        grantRole(PATIEN_ROLE, patientAddress);
        grantRole(REGISTERED_USER_ROLE, patientAddress);
    }

    function isPatientRegistered(address patientAddress) public view returns (bool){
            return hasRole(PATIEN_ROLE, patientAddress);
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