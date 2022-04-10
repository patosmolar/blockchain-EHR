// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./RolesManager.sol";

contract MedicalRecords {

    mapping(address => string) public records;

    function addRecord(address patientAddress, string fileHash) public onlyMember(GRANTER_ROLE){
        
        records[patientAddress] = fileHash;
    }

    function updateRecord() public {
    }

    function viewRecord(address recordOwner) public  view returns (string memory) {
        return records[recordOwner];
    }

    function deleteRecord() public {
    }    

    function grantAccess() public {

    }

}