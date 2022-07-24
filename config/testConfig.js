
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x01b38eac4a0df7dd75e17f2bdb4ab7f639db5e64",
        "0x4f76136417d5ffbf4487122dcca29a3bdd1b0afc",
        "0xc64e329cc611c5e5fbb1231a1c605a67e49cbd40",
        "0x0965f985544a0a0b9a3c6e815d67f59beec1a350",
        "0xf72f4a3e9cefd4269f794c179fafec569d281634",
        "0x959909df54ec5ed3909cc39617c06c1531cc01d3",
        "0xa475f8d7ab23f827482357057b209d663e2e292e",
        "0x5acf9427de707d69adc11f48de4f0816d3610fb0",
        "0xf53499def11aee0e034f172c82d55bd494aa9843",
        "0xa5367c18a49f7da5587ea113d342b2ced544ccc9"
    ];

    let owner = accounts[0];
    let firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.new();
    let flightSuretyApp = await FlightSuretyApp.new();

    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};