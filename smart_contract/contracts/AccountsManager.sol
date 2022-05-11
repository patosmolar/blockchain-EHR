// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Accounts Manager contract.
/// @author Patrik Smolár.
/// @notice Smart contract for managing accounts and roles.
/// @dev Contract extends AccessControl from openZeppelin.
contract AccountsManager is AccessControl {
    /// @notice Registration object.
    /// @dev Object for storing accounts data.
    struct Registration {
        string publicKey;
        string privateKey;
        bool isValue;
    }

    /// @notice Variables for roles definition.
    /// @dev Defines base roles.
    bytes32 public constant PATIENT_ROLE = "PATIENT_ROLE";
    bytes32 public constant DOCTOR_ROLE = "DOCTOR_ROLE";
    bytes32 public constant REGISTERED_USER_ROLE = "REGISTERED_USER_ROLE";

    /// @notice Main storage for accounts registration.
    /// @dev Key-pair where key -> accounts address, value -> accounts data.
    mapping(address => Registration) private credentials;

    /// @notice Constructor.
    /// @dev Add msg.sender as a member of the deafault roles.
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PATIENT_ROLE, msg.sender);
        _setupRole(DOCTOR_ROLE, msg.sender);
        _setupRole(REGISTERED_USER_ROLE, msg.sender);
        credentials[msg.sender] = Registration("{}", "{}", true);
    }

    /// @notice Registers new doctor.
    /// @dev Doctor grants correct roles and his credentials are stored in credentials mapping.
    /// @dev Sender needs DEFAULT_ADMIN_ROLE.
    /// @dev credentials[doctorAddress].isValue has to be false, otherwise "Doctor alredy registered" is thrown.
    /// @param doctorAddress Addres of doctor to register.
    /// @param publicKey Doctor's public key.
    /// @param privateKey Doctor's private key.
    function registerDoctor(
        address doctorAddress,
        string memory publicKey,
        string memory privateKey
    ) external onlyMember(DEFAULT_ADMIN_ROLE) {
        require(
            credentials[doctorAddress].isValue == false,
            "Doctor alredy registered"
        );
        grantRole(DOCTOR_ROLE, doctorAddress);
        grantRole(REGISTERED_USER_ROLE, doctorAddress);
        credentials[doctorAddress] = Registration(publicKey, privateKey, true);
    }

    /// @notice Removes doctor's registration.
    /// @dev Sender needs DEFAULT_ADMIN_ROLE.
    /// @dev credentials[doctorAddress].isValue has to be true,
    /// otherwise "Doctor not registered" is thrown.
    /// @param doctorAddress Addres of doctor to de-register.
    function revokeDoctor(address doctorAddress)
        external
        onlyMember(DEFAULT_ADMIN_ROLE)
    {
        require(
            credentials[doctorAddress].isValue == true,
            "Doctor not registered"
        );
        revokeRole(DOCTOR_ROLE, doctorAddress);
        revokeRole(REGISTERED_USER_ROLE, doctorAddress);
        delete credentials[doctorAddress];
    }

    /// @notice Registers new patient.
    /// @dev patient grants correct roles and his credentials are stored in credentials mapping.
    /// @dev Sender needs DOCTOR_ROLE.
    /// @dev credentials[doctorAddress].isValue has to be false,
    /// otherwise "Patient alredy registered" is thrown.
    /// @param patientAddress Addres of patient to register.
    /// @param publicKey Patient's public key.
    /// @param privateKey Patient's private key.
    function registerNewPatient(
        address patientAddress,
        string memory publicKey,
        string memory privateKey
    ) external onlyMember(DOCTOR_ROLE) {
        require(
            credentials[patientAddress].isValue == false,
            "Patient alredy registered"
        );
        _grantRole(PATIENT_ROLE, patientAddress);
        _grantRole(REGISTERED_USER_ROLE, patientAddress);
        credentials[patientAddress] = Registration(publicKey, privateKey, true);
    }

    /// @notice Removes patien's registration.
    /// @dev Sender needs DOCTOR_ROLE.
    /// @dev credentials[doctorAddress].isValue has to be true, 
    /// otherwise "Patient not registered" is thrown.
    /// @param patientAddress Addres of patient to de-register.
    function revokePatient(address patientAddress)
        external
        onlyMember(DOCTOR_ROLE)
    {
        require(
            credentials[patientAddress].isValue == true,
            "Patient not registered"
        );
        _revokeRole(PATIENT_ROLE, patientAddress);
        _revokeRole(REGISTERED_USER_ROLE, patientAddress);
        delete credentials[patientAddress];
    }

    /// @notice Retreive public key.
    /// @dev Retreive public key from credentials mapping.
    /// @param addr Addres of account to retreive his public key.
    /// @return Public key of acoount with addr key.
    function getPublicKey(address addr) public view returns (string memory) {
        return credentials[addr].publicKey;
    }

    /// @notice Retreive private key.
    /// @dev Retreive private key from credentials mapping.
    /// @return Msg.sender's private key.
    function getPrivateKey() public view returns (string memory) {
        return credentials[msg.sender].privateKey;
    }

    /// @notice Check if account is registered.
    /// @dev If account not added in mapping, isValue will be false by default.
    /// @dev At Registration constructor this value is set to true.
    /// @param addr Addres of account to check registration.
    /// @return True if registered, false otherwise.
    function isAccountRegistered(address addr) public view returns (bool) {
        return credentials[addr].isValue;
    }

    /// @notice Check if account is doctor.
    /// @dev Checks if account has role DOCTOR_ROLE;
    /// @param doctorAddr Addres of potential doctor to check role.
    /// @return True if account is doctor, false otherwise.
    function isDoctorRegistered(address doctorAddr) public view returns (bool) {
        return hasRole(DOCTOR_ROLE, doctorAddr);
    }

    /// @notice Check if account is patient.
    /// @dev Checks if account has role PATIENT_ROLE;
    /// @param patientAddress Addres of potential patient to check role.
    /// @return True if account is patient, false otherwise.
    function isPatientRegistered(address patientAddress)
        public
        view
        returns (bool)
    {
        return hasRole(PATIENT_ROLE, patientAddress);
    }

    /// @notice Check if account is administrator.
    /// @dev Checks if account can call method with onlyMember(DEFAULT_ADMIN_ROLE) modifier.
    /// @return True if account is patient, otherwise throws "Restricted".
    function isAdmin()
        public
        view
        onlyMember(DEFAULT_ADMIN_ROLE)
        returns (bool)
    {
        return true;
    }

    /// @notice Function to check role of address.
    /// @param roleId If of role to check.
    /// @param addr Account's address to check role.
    /// @return True if account has role, false otherwise.
    function isMemberOf(bytes32 roleId, address addr)
        public
        view
        returns (bool)
    {
        return hasRole(roleId, addr);
    }

    /// @dev Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(hasRole(roleId, msg.sender), "Restricted");
        _;
    }
}
