const main = async () => {
  const IPFS = await hre.ethers.getContractFactory('IPFS');
  const ipfs = await IPFS.deploy();

  await ipfs.deployed();

  console.log("IPFS  deployed to:", ipfs.address);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

runMain();