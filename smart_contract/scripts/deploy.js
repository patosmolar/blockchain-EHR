const main = async() => {
    const AccountsManager = await hre.ethers.getContractFactory('AccountsManager');
    const aManager = await AccountsManager.deploy();

    await aManager.deployed();

    console.log("AccountsManager  deployed to:", aManager.address);

    const MedicalRecords = await hre.ethers.getContractFactory('MedicalRecords');
    const records = await MedicalRecords.deploy(aManager.address);

    await records.deployed();

    console.log("MedicalRecords  deployed to:", records.address);
}

const runMain = async() => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

runMain();