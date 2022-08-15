var HDWalletProvider = require("@truffle/hdwallet-provider");
var mnemonic = "random girl affair wheel mystery repeat actual citizen pet ticket tourist bid";

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