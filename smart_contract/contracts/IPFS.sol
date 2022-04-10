// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
contract IPFS {
    mapping(address => string) public fileHash;
    uint public count = 0;

    function sendHash(address owner, string memory x) public {
        count++;
        fileHash[owner] = x;
    }
    
    function getHash(address owner) public view returns (string memory) {
        return fileHash[owner];
    }
}