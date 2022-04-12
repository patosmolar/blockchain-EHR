const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccountsManager", function() {
    it("Should register patient and return true for isRegistered", async function() {


        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        var t1 = await manager.registerDoctor("0x2C9353499784c1D3BBA16648903BAa030d3452f1");
        var t2 = await manager.registerNewPatient("0x0436Ee0D71e5c7AD270DD93288e65F7E6320B818");

        // wait until the transaction is mined
        await t1.wait();
        await t2.wait();
        var isPatietnRegistered = await manager.isPatientRegistered("0x0436Ee0D71e5c7AD270DD93288e65F7E6320B818");
        expect(isPatietnRegistered).to.equal(true);
    });
});