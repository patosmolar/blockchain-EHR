const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IPFS", function() {
    it("Should store and return hash", async function() {
        const address = "0x49bC0c80a2968e4c77B97d285A976d91Dc011Ce2";
        const hash = "c972f66c9fe0e21f0a259ef9b6db5e08e46d4a4f480b29c7a1755efe0216602de9ef626086803ced257773c469fab1c54f0df823c36369067942baff133e8753";

        const IPFS = await ethers.getContractFactory("IPFS");
        const ipfs = await IPFS.deploy();
        await ipfs.deployed();
        const transaction = await ipfs.sendHash(address, hash);

        // wait until the transaction is mined
        await transaction.wait();
        var hashFromNet = await ipfs.getHash(address);
        expect(hashFromNet).to.equal(hash);
    });
});