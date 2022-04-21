const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccountsManager", function() {
    it("Should register patient and return true for isRegistered", async function() {

        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        var t1 = await manager.registerDoctor(addr1.address);
        await t1.wait();

        var t2 = await manager.registerNewPatient(addr2.address);
        await t2.wait();

        var isPatietnRegistered = await manager.isPatientRegistered(addr2.address);
        expect(isPatietnRegistered).to.equal(true);
    });
});