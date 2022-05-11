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
            accounts: ['2208aa28be12581a4c452b5dc4d7b50b725113580e0db3c085eb77c6bf79a719']
        }
    }
};