const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalRecords", function() {
    it("Doctor can add medical folder for patient and retreive doctr's fileHash", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(addr1).addMedicalFolder(addr2.address,
            "ecd73f75e1b47c73bda27f89458fbf6e7ecdca8ca3c1ace5d9e4bd45f4ba0ffc",
            "ecd73f75e1b47c73bda27f89458fbf6e7ecdca8ca3c1ace5d9e4bd45f4ba0ffc",
            addr1.address);

        var r1 = await records.connect(addr1).getMediacalRecordDoctor(addr2.address);
        expect(r1).to.equal("ecd73f75e1b47c73bda27f89458fbf6e7ecdca8ca3c1ace5d9e4bd45f4ba0ffc");
    });
    it("Doctor cannot add medical folder if aldredy added end get error", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(addr1).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            addr1.address);

        var r1 = await records.connect(addr1).getMediacalRecordDoctor(addr2.address);
        expect(r1).to.equal("mainFileHash");

        await expect(records.connect(addr1).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            addr1.address)).to.be.revertedWith("User alredy posses medical folder");

    });
    it("Patient can get his file after succesfully added by doctor", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(addr1).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            addr1.address);

        var r1 = await records.connect(addr2).getMediacalRecordPatient();
        expect(r1).to.equal("patientFileHash");
    });
    it("Doctor cannot get mainFile if not mainFileCurrentOwner", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(owner).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            owner.address);

        await expect(records.connect(addr1).getMediacalRecordDoctor(addr2.address)).to.be.revertedWith("Unauthorized");
    });
    it("Doctor cannot update medicalFolder if not mainFileCurrentOwner", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(owner).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            owner.address);

        await expect(records.connect(addr1).updateMedicalFolder(addr2.address, "a", "a", addr1.address)).to.be.revertedWith("Not mainFile owner");
    });
    it("Doctor cannot update mainFile patient denyed folder edit", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(owner).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            owner.address);

        await records.connect(addr2).denyFolderEdit();

        await expect(records.connect(owner).updateMedicalFolder(addr2.address, "a", "a", addr1.address)).to.be.revertedWith("Folder not editable");
    });
    it("Doctor cannot update mainFile patient denyed folder edit and after allowing can", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(owner).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            owner.address);

        await records.connect(addr2).denyFolderEdit();

        await expect(records.connect(owner).updateMedicalFolder(addr2.address, "a", "a", owner.address)).to.be.revertedWith("Folder not editable");

        await records.connect(addr2).allowFolderEdit();

        await records.connect(owner).updateMedicalFolder(addr2.address, "a", "a", owner.address);
        var r1 = await records.connect(owner).getMediacalRecordDoctor(addr2.address);
        expect(r1).to.equal("a");
    });
    it("Doctor can change mainFile owner", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(owner).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            owner.address);

        await records.connect(owner).updateMedicalFolder(addr2.address, "a", "a", addr1.address);
        var r1 = await records.connect(addr1).getMediacalRecordDoctor(addr2.address);
        expect(r1).to.equal("a");
    });
    it("Doctor cannot delete medicalFolder if not mainFileCurrentOwner", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(owner).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            owner.address);

        await expect(records.connect(addr1).deleteMedicalFolder(addr2.address)).to.be.revertedWith("Not mainFile owner");
    });
    it("Doctor cannot delete mainFile patient denyed folder edit", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(owner).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            owner.address);

        await records.connect(addr2).denyFolderEdit();

        await expect(records.connect(owner).deleteMedicalFolder(addr2.address)).to.be.revertedWith("Folder not editable");
    });
    it("Doctor can delete folder", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, "a", "a");
        await manager.connect(addr1).registerNewPatient(addr2.address, "a", "a");

        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        await records.connect(owner).addMedicalFolder(addr2.address,
            "mainFileHash",
            "patientFileHash",
            owner.address);

        await records.connect(owner).deleteMedicalFolder(addr2.address);
    });
});