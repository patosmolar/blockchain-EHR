require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-solhint");
require("hardhat-gas-reporter");
module.exports = {
    gasReporter: {
        currency: "USD",
        gasPrice: 90,
    },
    solidity: "0.8.4",
    networks: {
        local: {
            url: 'http://127.0.0.1:7545',
            accounts: ['ea3af216c29639d857ec1a0bbf48a044193bd5e2f3e465ff2298e99c01a5cdd0']
        },
		hardhatLocal: {
            url: 'http://127.0.0.1:8545',
            accounts: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80']
        }
    }
};