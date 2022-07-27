
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x906c60a98bc4128f87bdf155147b3626d49dac43",
        "0xffd0cbb612fe434b4a169a4e6d7387ae71bf4c8d",
        "0x4cb1e4eecb510fde8cf06f8eceffb68927fb8777",
        "0xbb87376b8be12ac19e4ad288009325bdbed2a6c1",
        "0x14455ab9e5be56c2d7721ddc1af6fb1be6599b56",
        "0xcca7a1820b691ce002b1e2be8395a807329a6f66",
        "0x8cd1eff023d0b904c81af1055e462f42058769a1",
        "0x6c4e064eb651362d9197f7c118fa455e7b1ea873",
        "0xb41e5c2cd5c51f7162dd39ac040c0cf04646743f",
        "0xb8c558b681c8e45544bbcb2d255e47c45b1521ff"
    ];


    let owner = accounts[0];
    let firstAirline = accounts[1];
    let firstPassenger = accounts[8];

    let flightSuretyData = await FlightSuretyData.new();
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp,
        firstPassenger: firstPassenger,
    }
}

module.exports = {
    Config: Config
};