var HDWalletProvider = require("@truffle/hdwallet-provider");
var mnemonic = "";

module.exports = {
  networks: {
    develop: {
        port: 9545,
        network_id: 20,
        accounts: 30,
        defaultEtherBalance: 100,
        blockTime: 1
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};