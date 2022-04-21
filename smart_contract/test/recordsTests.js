const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Records", function() {
    it("Should add patients record", async function() {
        const pubKey1 = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDNJfKL2XczEVAx3Q2htnLuo3xtCSMTDaoawrTBkGZZ1PrlskTtyFnHo1R6QZ3eaiLCm+Z5748/idqp9VLJ2GLXstCjdOLnSDIVCr9Ejlj0SBDFw835u4PLiZNX3T3S9/OZlKDXNq/AxIsxIfaQUQKtbSPDTfVCydHXGF6E/cLdIwIDAQAB";
        const pubKey2 = "QIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDNJfKL2XczEVAx3Q2htnLuo3xtCSMTDaoawrTBkGZZ1PrlskTtyFnHo1R6QZ3eaiLCm+Z5748/idqp9VLJ2GLXstCjdOLnSDIVCr9Ejlj0SBDFw835u4PLiZNX3T3S9/OZlKDXNq/AxIsxIfaQUQKtbSPDTfVCydHXGF6E/cLdIwIDAQAB";
        const priKey1 = "MIICXQIBAAKBgQDNJfKL2XczEVAx3Q2htnLuo3xtCSMTDaoawrTBkGZZ1PrlskTtyFnHo1R6QZ3eaiLCm+Z5748/idqp9VLJ2GLXstCjdOLnSDIVCr9Ejlj0SBDFw835u4PLiZNX3T3S9/OZlKDXNq/AxIsxIfaQUQKtbSPDTfVCydHXGF6E/cLdIwIDAQABAoGAGjAT7EJQcxZstFDRoqkVttzrz0dxUMdXxZ7BUExMpH8JoDTHk8sVmuSArjKeInxN/6XDICGymZvRbAzDCr0ysLey49jsn/ycPjTo4k3v49Vh9KfJHMl7S2EiOORpxRuXHTgvyIxBgSQWezqz8b9XEdT7Gyfc3GW0sgeF2ZyfIXECQQDv6p7IbEiHqvW1gauEERQnImvB/Rr6qTCmx9zo3KsN3GEwNTzBAmwxbaZzGfEopbimbE/+oBANf0v/frgMQzs9AkEA2uak5rYeMa4FSaPyy6rIKRO+Yhc7k2E4CN+dRLcIyHws+CBtWqAB2DjL8oNg0REX5067nmcfMgm5LJWXYPt/3wJBAKNJD6Bg8kxDss9B3bYY2Zp49tYkqYQIOrCIPnXOGi1o3EyvLxY9y90oP6z+7v83KyE5fohR8Br/lH3jhOfzqhECQQDKZpqwrFHs06AWAB6+TLH4sUXGwv6V/j1mjwSGhcr8PT0DTFBwjCRIffOtz+ZUST7V5Em8ZFNG3BC49bRbuw/3AkAQPgZz9Y7XS8jWBSwQEt/hiPgvYdGbLfIXNOPRUJH0FJ32qC/ZRUUhQPupudDwIyEkehieNBhq/biF8TBAdlat";
        const priKey2 = "QIICXQIBAAKBgQDNJfKL2XczEVAx3Q2htnLuo3xtCSMTDaoawrTBkGZZ1PrlskTtyFnHo1R6QZ3eaiLCm+Z5748/idqp9VLJ2GLXstCjdOLnSDIVCr9Ejlj0SBDFw835u4PLiZNX3T3S9/OZlKDXNq/AxIsxIfaQUQKtbSPDTfVCydHXGF6E/cLdIwIDAQABAoGAGjAT7EJQcxZstFDRoqkVttzrz0dxUMdXxZ7BUExMpH8JoDTHk8sVmuSArjKeInxN/6XDICGymZvRbAzDCr0ysLey49jsn/ycPjTo4k3v49Vh9KfJHMl7S2EiOORpxRuXHTgvyIxBgSQWezqz8b9XEdT7Gyfc3GW0sgeF2ZyfIXECQQDv6p7IbEiHqvW1gauEERQnImvB/Rr6qTCmx9zo3KsN3GEwNTzBAmwxbaZzGfEopbimbE/+oBANf0v/frgMQzs9AkEA2uak5rYeMa4FSaPyy6rIKRO+Yhc7k2E4CN+dRLcIyHws+CBtWqAB2DjL8oNg0REX5067nmcfMgm5LJWXYPt/3wJBAKNJD6Bg8kxDss9B3bYY2Zp49tYkqYQIOrCIPnXOGi1o3EyvLxY9y90oP6z+7v83KyE5fohR8Br/lH3jhOfzqhECQQDKZpqwrFHs06AWAB6+TLH4sUXGwv6V/j1mjwSGhcr8PT0DTFBwjCRIffOtz+ZUST7V5Em8ZFNG3BC49bRbuw/3AkAQPgZz9Y7XS8jWBSwQEt/hiPgvYdGbLfIXNOPRUJH0FJ32qC/ZRUUhQPupudDwIyEkehieNBhq/biF8TBAdlat";
        const [owner, addr1, addr2] = await ethers.getSigners();

        const AccountsManager = await ethers.getContractFactory("AccountsManager");
        const manager = await AccountsManager.deploy();
        await manager.deployed();

        var t1 = await manager.registerDoctor(addr1.address);
        await t1.wait();

        var t2 = await manager.registerNewPatient(addr2.address);
        await t2.wait();


        const Records = await ethers.getContractFactory("MedicalRecords");
        const records = await Records.deploy(manager.address);
        await records.deployed();

        var r1 = await records.connect(addr1).registerDevice(pubKey1);
        var r2 = await records.connect(addr2).registerDevice(pubKey2);
        await r1.wait();
        await r2.wait();

        var r3 = await records.connect(addr1).addMedicalRecord(addr2.address, "mainFileHash", "patientFileHash", addr1.address);
        await r3.wait();

        const patientHash = await records.connect(addr2).getMediacalRecordPatient();
        const doctorsHash = await records.connect(addr1).getMediacalRecordDoctor(addr2.address);

        expect(patientHash).to.equal("patientFileHash");
        expect(doctorsHash).to.equal("mainFileHash");
    });
});