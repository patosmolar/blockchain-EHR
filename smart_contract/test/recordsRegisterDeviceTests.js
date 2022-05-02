const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalRecords", function() {
    it("Cannot register device if not previously registered as patient or doctor", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await expect(records.connect(addr1).registerDevice("test", false)).to.be.revertedWith("Restricted to members.");
    });
    it("Can register device as doctor or patient and return it via getPublicKey", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address);
        await manager.connect(addr1).registerNewPatient(addr2.address);

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(addr1).registerDevice("test", false);
        await records.connect(addr2).registerDevice("test", false);

        var p1 = await records.connect(addr1).getPublicKey(addr1.address);
        var p2 = await records.connect(addr2).getPublicKey(addr2.address);

        expect(p1).to.equal("test");
        expect(p2).to.equal("test");
    });
    it("RegisterDevice throws error and dont change data when device alredy registered and force == false", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address);

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(addr1).registerDevice("test", false);
        await expect(records.connect(addr1).registerDevice("test2", false)).to.be.revertedWith("User alredy have device registered and force is set to false");
    });
    it("RegisterDevice change data when device alredy registered and force == true", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address);

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(addr1).registerDevice("test", false);
        await records.connect(addr1).registerDevice("test2", true);
        var p1 = await records.connect(addr1).getPublicKey(addr1.address);
        expect(p1).to.equal("test2");
    });
});