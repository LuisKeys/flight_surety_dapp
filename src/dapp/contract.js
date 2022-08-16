import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.accounts = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            this.accounts = accts;

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    async isOperational(callback) {
        let self = this;        
        self.flightSuretyApp.methods.isOperational.call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    viewFlightStatus(airline, flight, callback) {
        let self = this;
        let payload = {
            airline: airline,
            flight: flight
        }
        self.flightSuretyApp.methods
            .viewFlightStatus(payload.flight, payload.airline)
            .call({ from: self.accounts[0]}, (error, result) => {
                callback(error, result);
            });
    }    

    async buyInsurance(flight, price, callback) {
        let self = this;
        let weiPrice = this.web3.utils.toWei(price.toString(), "ether");
        let payload = {flight: flight, price: weiPrice, passenger: self.accounts[0]};
        //First passenger - hardcoded
        payload.passenger = this.accounts[8];

        self.flightSuretyData.methods.buy(flight)
            .send({ from: payload.passenger, value: weiPrice,
                gas: 500000,
                gasPrice: 1
            }, (error, result) => {
                callback(error, payload);
            });
    }

    async getCredit(callback) {
        let self = this;
        //First passenger - hardcoded
        let passenger = this.accounts[8];
        self.flightSuretyData.methods.getPaxCredit().call({ from: passenger}, (error, result) => {
            callback(error, result);
        });
    }

    async withdraw(callback) {
        let self = this;
        //First passenger - hardcoded
        let passenger = this.accounts[8];
        self.flightSuretyData.methods.pay(self.accounts[0]).send({ from: passenger}, (error, result) => {
            callback(error, result);
        });
    }    
}