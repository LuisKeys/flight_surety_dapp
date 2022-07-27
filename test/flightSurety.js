
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.addAuthorizedCaller(config.flightSuretyApp.address, { from: accounts[0] });
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

    it(`Data contract authorize App contract`, async function () {

        // Get authorization status
        let status = await config.flightSuretyData.isAuthorized.call(config.flightSuretyApp.address);
        assert.equal(status, true, "App contract must be authorized");

    });

    it(`(multiparty) has correct initial isOperational() value`, async function () {

        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try 
        {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        }
        catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
                
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try 
        {
            await config.flightSuretyData.setOperatingStatus(false);
        }
        catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
        
    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

        await config.flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try 
        {
            await config.flightSurety.setTestingMode(true);
        }
        catch(e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);

    });

    it('Contract owner is one airline', async () => {
        let airlinesCount = await config.flightSuretyData.airlinesRegistered.call(); 
        assert.equal(airlinesCount, 1, "One airline expected to deploy the contract.");
    });

    it('Airline registgration: fund check', async () => {
        
        let airline = accounts[2];
        let result = await config.flightSuretyData.registerAirline(airline, {from: config.firstAirline});
        result = await config.flightSuretyData.isAirline.call(airline); 
        assert.equal(result, true, "Only funded airline can registrer a new airline");
        let airlinesRegistered = await config.flightSuretyData.airlinesRegistered.call(); 
        assert.equal(airlinesRegistered, 2, "2 airlines should be registered at this poitn (seed and the second one).");
    });

    it("While registered count is <= 4 no additional consensus is required", async () => {

        let airlinesRegistered = await config.flightSuretyData.airlinesRegistered.call(); 
        await config.flightSuretyApp.registerAirline(accounts[3], "Great Skies Domestic", {from: accounts[0]});
        await config.flightSuretyApp.registerAirline(accounts[4], "New Skies International", {from: accounts[0]});
        airlinesRegistered = await config.flightSuretyData.airlinesRegistered.call(); 

        assert.equal(airlinesRegistered, 4, "4 airlines are required to check condition.");
    });

    it("Once registered count is >= 4, then 50% votes are required to register a new one", async () => {

        airlinesRegistered = await config.flightSuretyData.airlinesRegistered.call(); 
        assert.equal(airlinesRegistered, 4, "4 airlines are required at this point.");

        await config.flightSuretyApp.registerAirline(accounts[5], "Worldwide Airlines", {from: accounts[2]});
        let result = await config.flightSuretyData.isAirline.call(accounts[5]);
        let airlinesCount = await config.flightSuretyData.airlinesRegistered.call(); 

        assert.equal(airlinesCount, 4, "Airlines count should be 4, this one should not be registered due to missing 50% of voters.");
    });

    it('Checks flight registration ', async () => {
        timestamp = Math.floor(Date.now() / 1000); //convert ms to seconds
        await config.flightSuretyApp.registerFlight("FSADL1358", timestamp, {from: accounts[2]});
        //await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, "FSADL1358", timestamp, {from: config.firstPassenger}); 
    });      
    
});
