// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract RolesManager is AccessControl {
    bytes32 constant GRANTER_ROLE = sha256("GRANTER_ROLE");

    bytes32 constant PATIEN_ROLE = sha256("PATIEN_ROLE");
    bytes32 constant PRIMARY_CARE_DOCTOR_ROLE = sha256("PRIMARY_CARE_DOCTOR_ROLE");
    bytes32 constant ALERGIST_ROLE = sha256("ALERGIST_ROLE");


    /// @dev Add `root` as a member of the root role.
    constructor (address root) public {
        _setupRole(DEFAULT_ADMIN_ROLE, root);
        _setupRole(GRANTER_ROLE, root);
        _setupRole(PATIEN_ROLE, root);
        _setupRole(PRIMARY_CARE_DOCTOR_ROLE, root);
        _setupRole(ALERGIST_ROLE, root);
    }


    function registerDoctor(bytes32 roleId, address doctorAddress) public onlyMember(DEFAULT_ADMIN_ROLE){
        grantRole(GRANTER_ROLE, doctorAddress);
        grantRole(roleId, doctorAddress);
    }

    function registerNewPatient(address patientAddress) public onlyMember(GRANTER_ROLE){
        grantRole(PATIEN_ROLE, patientAddress);
    }


    /// @dev Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(hasRole(roleId, msg.sender), "Restricted to members.");
        _;
    }

    /// @dev Create a new role with the specified admin role.
    function addRole(bytes32 roleId, bytes32 adminRoleId) private onlyMember(adminRoleId)
    {
        _setRoleAdmin(roleId, adminRoleId);
    }

    /// @dev Grant an account a role .
    function grantRole(bytes32 roleId, address account) private onlyMember(GRANTER_ROLE)
    {
        grantRole(roleId, account);
    }

}