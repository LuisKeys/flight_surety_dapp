
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  const FLIGHT_CODE = "FSADL1358"
  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.addAuthorizedCaller(config.flightSuretyApp.address, { from: accounts[0] });
  });

  contract("Accounts to console for handy checks", async (accounts) => {
    console.log(accounts)
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

    //Check access to set the operating status > block
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

    //Check access to set the operating status > allow
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

    //Check blocked access to functions when operating status is false
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

    //Seed airline to create the contract
    it('Contract owner is one airline', async () => {
        let airlinesCount = await config.flightSuretyData.airlinesRegistered.call(); 
        assert.equal(airlinesCount, 1, "One airline expected to deploy the contract.");
    });

    //Check airline registration process
    it('Airline registgration: fund check', async () => {
        
        let airline = accounts[2];
        let result = await config.flightSuretyData.registerAirline(airline, {from: config.firstAirline});
        result = await config.flightSuretyData.isAirline.call(airline); 
        assert.equal(result, true, "Only funded airline can registrer a new airline");
        let airlinesRegistered = await config.flightSuretyData.airlinesRegistered.call(); 
        assert.equal(airlinesRegistered, 2, "2 airlines should be registered at this poitn (seed and the second one).");
    });

    //Check airline consensus process below or equal the 4 or less airlines threshold
    it("While registered count is <= 4 no additional consensus is required", async () => {

        let airlinesRegistered = await config.flightSuretyData.airlinesRegistered.call(); 
        await config.flightSuretyApp.registerAirline(accounts[3], "Great Skies Domestic", {from: accounts[0]});
        await config.flightSuretyApp.registerAirline(accounts[4], "New Skies International", {from: accounts[0]});
        airlinesRegistered = await config.flightSuretyData.airlinesRegistered.call(); 

        assert.equal(airlinesRegistered, 4, "4 airlines are required to check condition.");
    });

    //Check airline consensus process when more than 4 airlines are registered
    it("Once registered count is >= 4, then 50% votes are required to register a new one", async () => {

        airlinesRegistered = await config.flightSuretyData.airlinesRegistered.call(); 
        assert.equal(airlinesRegistered, 4, "4 airlines are required at this point.");

        await config.flightSuretyApp.registerAirline(accounts[5], "Worldwide Airlines", {from: accounts[2]});
        let result = await config.flightSuretyData.isAirline.call(accounts[5]);
        let airlinesCount = await config.flightSuretyData.airlinesRegistered.call(); 

        assert.equal(airlinesCount, 4, "Airlines count should be 4, this one should not be registered due to missing 50% of voters.");
    });

    //Check flight registration process
    it('Checks flight registration ', async () => {
        timestamp = Math.floor(Date.now() / 1000); //convert ms to seconds
        await config.flightSuretyApp.registerFlight(FLIGHT_CODE, timestamp, {from: accounts[2]});
        await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, FLIGHT_CODE, timestamp, {from: config.firstPassenger}); 
    });      
    
    //Check passenger buy an insurance for a flight
    it("Checks passenger buy a flight insurance", async () => {
        let maxInsurancePrice = await config.flightSuretyData.MAXIMUM_INSURANCE_PRICE.call();
        await config.flightSuretyData.buy(FLIGHT_CODE, {from: config.firstPassenger, value: maxInsurancePrice});
        let passenger = await config.flightSuretyData.getPax.call(0); 
        assert.equal(passenger, config.firstPassenger, "Passenger was stored.");
      });

      it("Check oracles instantiation", async () => {
        let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();
        const  baseAccount = 10;
        const  oraclesCount = 22;
        for(let i = baseAccount; i < (baseAccount + oraclesCount); i++) {      
            console.log("Oracle account:" + accounts[i]);
            await config.flightSuretyApp.registerOracle({ from: accounts[i], value: fee});
            let result = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[i]});
            assert.equal(result.length, 3, 'Oracle must be registered with 3 unique numbers combination');
        }
      });
    
});
