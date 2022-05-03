const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccountsManager", function() {
    it("Sould not allow unregistered doctor register patient", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        await expect(manager.connect(addr1).registerNewPatient(addr1.address, "a", "a")).to.be.revertedWith("Restricted to members.");
    });
    it("Should register doctor and patient succesfully and return true for isRegistered", async function() {

        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        await manager.registerDoctor(addr1.address, "a", "a");
        var isDoctorRegitered = await manager.isDoctorRegistered(addr1.address);
        expect(isDoctorRegitered).to.equal(true);

        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");
        var isPatietnRegistered = await manager.isPatientRegistered(addr2.address);
        expect(isPatietnRegistered).to.equal(true);
    });
    it("Should register doctor and patient succesfully then revoke their roles", async function() {

        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        await manager.registerDoctor(addr1.address, "a", "a");
        var isDoctorRegitered = await manager.isDoctorRegistered(addr1.address);
        expect(isDoctorRegitered).to.equal(true);

        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");
        var isPatietnRegistered = await manager.isPatientRegistered(addr2.address);
        expect(isPatietnRegistered).to.equal(true);

        await manager.connect(addr1).revokePatient(addr2.address);
        var isPatietnRegistered = await manager.isPatientRegistered(addr2.address);
        expect(isPatietnRegistered).to.equal(false);

        await manager.revokeDoctor(addr1.address);
        var isDoctorRegitered = await manager.isDoctorRegistered(addr1.address);
        expect(isDoctorRegitered).to.equal(false);
    });
    it("registerDoctor throws error and dont change data when alredy registered", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");

        await expect(manager.registerDoctor(addr1.address, "a", "a")).to.be.revertedWith("Doctor alredy registered");
    });
    it("registerNewPatient throws error and dont change data when alredy registered", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerNewPatient(addr1.address, "a", "a");

        await expect(manager.registerNewPatient(addr1.address, "a", "a")).to.be.revertedWith("Patient alredy registered");
    });
    it("isAccountRegistered returns correct values", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");

        var t1 = await manager.isAccountRegistered(addr1.address);
        var t2 = await manager.isAccountRegistered(addr2.address);

        expect(t1).to.equals(true);
        expect(t2).to.equals(false);
    });
});