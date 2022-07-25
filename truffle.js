var HDWalletProvider = require("@truffle/hdwallet-provider");
var mnemonic = "random girl affair wheel mystery repeat actual citizen pet ticket tourist bid";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider({
              mnemonic: mnemonic, 
              providerOrUrl: "http://127.0.0.1:9545/", 
              numberOfAddresses: 10});
      },
      network_id: '*',
      gas: 9999999
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};