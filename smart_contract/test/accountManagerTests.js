const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccountsManager", function() {
    it("Sould not allow unregistered doctor register patient", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        await expect(manager.connect(addr1).registerNewPatient(addr1.address)).to.be.revertedWith("Restricted to members.");
    });
    it("Should register doctor and patient succesfully and return true for isRegistered", async function() {

        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        await manager.registerDoctor(addr1.address);
        var isDoctorRegitered = await manager.isDoctorRegistered(addr1.address);
        expect(isDoctorRegitered).to.equal(true);

        await manager.connect(addr1).registerNewPatient(addr2.address);
        var isPatietnRegistered = await manager.isPatientRegistered(addr2.address);
        expect(isPatietnRegistered).to.equal(true);
    });
    it("Should register doctor and patient succesfully then revoke their roles", async function() {

        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        await manager.registerDoctor(addr1.address);
        var isDoctorRegitered = await manager.isDoctorRegistered(addr1.address);
        expect(isDoctorRegitered).to.equal(true);

        await manager.connect(addr1).registerNewPatient(addr2.address);
        var isPatietnRegistered = await manager.isPatientRegistered(addr2.address);
        expect(isPatietnRegistered).to.equal(true);

        await manager.connect(addr1).revokePatient(addr2.address);
        var isPatietnRegistered = await manager.isPatientRegistered(addr2.address);
        expect(isPatietnRegistered).to.equal(false);

        await manager.revokeDoctor(addr1.address);
        var isDoctorRegitered = await manager.isDoctorRegistered(addr1.address);
        expect(isDoctorRegitered).to.equal(false);
    });
});