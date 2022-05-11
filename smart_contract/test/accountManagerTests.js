const { expect } = require("chai");
const { ethers } = require("hardhat");

const pubKey = "{\"alg\":\"RSA-OAEP-256\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\"],\"kty\":\"RSA\",\"n\":\"tHJqW23tP01Wpar7ztii2GFlE5WINKffqQOkcC1k-42MqNGHA16vLU2MSH4547ApvuL9Ybyehb0d69brpSoSTfyU6QftfTsNb63lOgalMkPJnjgd6-fsPps2ss1QQhCtw_sFL_Mq1mdtrl-3QIUMrv8z1eU6SUX4huHxZhoZn_VTpzQffF8HKcN3dhGEIzlZbEGHCfEC4qlFOpjzehUa-0_vzbOw7rJIcaLlTZWlA5cqCxRr4C21NuCBti0Ugq-x3xNBDHV7ccvr7M50gBqwmPRXFGJo5YdahAf-71Kdp29i2JSZHEP5slSkiTQS7MdZYMF7JwkOyawZcNL1Ahhv0Q\"})";
const privKey = "Xü~|5§RmA)èà÷&çc[â©ÆcqysÆ?ÔíkÆ­¸5Ë÷Fx0ê§E -BLpê¤T7!/»~/0G¡äáæº5Ú	Õ±0;®{TéOÏ>ù`1EJz¶éü)y\G°,7)[2©jÞe3|¨# ¨q&óGMbTÛçI÷j14;Õ	«T_ØºãÙZy²è±9>vÞxQeP#;ø1Çþùä-olö#/óÑÒß\Q½`(å¸<,ÿÔa¹c>ÉÜ·×ðY<ºÎsR9 0² äk+liåWö©ÚY¶(º§QÙ¹ð-X´EhCiæñ@7iÏ ´^?¼Aâáyêz9Å¶açnQg¯ë|j2¬-rLÉÀ3:9Øj]ÏýÌiJ¢Û6ÞØ@zec oë/ánüjÝtJd§bo×åÃâ>ýÐQ³yL%ÞN?ÁÇYdLÅJsº«IÇ}/7­ÈUäÊ¦yFÐ	!¼.îË$îpZ¨BAÍj¿ãóGY+N@í£`V´èdY1fìeµ0¡uúÉîlòêwJ,ôÖrÏ¼¹·ÿÁ,J®üwçsÁòÇÁüvÛÊ¶Í$pöJJ¸Ètäo,bóÂi15øÇ{Y³ÍFùýæ";

describe("AccountsManager", function() {
    it("Sould not allow unregistered doctor register patient", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        await expect(manager.connect(addr1).registerNewPatient(addr1.address, privKey, pubKey)).to.be.revertedWith("Restricted");
    });
    it("Should register doctor and patient succesfully and return true for isRegistered", async function() {

        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        await manager.registerDoctor(addr1.address, privKey, pubKey);
        var isDoctorRegitered = await manager.isDoctorRegistered(addr1.address);
        expect(isDoctorRegitered).to.equal(true);

        await manager.connect(addr1).registerNewPatient(addr2.address, privKey, pubKey);
        var isPatietnRegistered = await manager.isPatientRegistered(addr2.address);
        expect(isPatietnRegistered).to.equal(true);
    });
    it("Should register doctor and patient succesfully then revoke their roles", async function() {

        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        await manager.registerDoctor(addr1.address, privKey, pubKey);
        var isDoctorRegitered = await manager.isDoctorRegistered(addr1.address);
        expect(isDoctorRegitered).to.equal(true);

        await manager.connect(addr1).registerNewPatient(addr2.address, privKey, pubKey);
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
        await manager.registerDoctor(addr1.address, privKey, pubKey);

        await expect(manager.registerDoctor(addr1.address, privKey, pubKey)).to.be.revertedWith("Doctor alredy registered");
    });
    it("registerNewPatient throws error and dont change data when alredy registered", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerNewPatient(addr1.address, privKey, pubKey);

        await expect(manager.registerNewPatient(addr1.address, privKey, pubKey)).to.be.revertedWith("Patient alredy registered");
    });
    it("isAccountRegistered returns correct values", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();
        await manager.registerDoctor(addr1.address, privKey, pubKey);

        var t1 = await manager.isAccountRegistered(addr1.address);
        var t2 = await manager.isAccountRegistered(addr2.address);

        expect(t1).to.equals(true);
        expect(t2).to.equals(false);
    });
});