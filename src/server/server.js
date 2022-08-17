const Config = require('./config.json');
const Web3 = require('web3');
const express = require('express');
const FlightSuretyData = require('../../build/contracts/FlightSuretyData.json');
const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

let STATUS_CODE_UNKNOWN = 0;
let STATUS_CODE_ON_TIME = 10;
let STATUS_CODE_LATE_AIRLINE = 20;
let STATUS_CODE_LATE_WEATHER = 30;
let STATUS_CODE_LATE_TECHNICAL = 40;
let STATUS_CODE_LATE_OTHER = 50;

let state = STATUS_CODE_ON_TIME;

const INSTANCES = 22;

let oracles = [];
let ixs = [];

const app = express();

app.get('/api', (req, res) => {
  res.send({
    message: 'API Server listener here :)'
  })
})

app.get('/api/status', (req, res) => {
  var status = req.query.status;
  console.log(status);

  var message = 'Status changed to: ';
  switch(status) {
    case '10':
      message = message.concat("ON TIME");
      state = STATUS_CODE_ON_TIME;
      break;
    case '20':
      message = message.concat("LATE AIRLINE");
      state = STATUS_CODE_LATE_AIRLINE;
      break;
    case '30':
      message = message.concat("LATE WEATHER");
      state = STATUS_CODE_LATE_WEATHER;
      break;
    case '40':
      message = message.concat("LATE TECHNICAL");
      state = STATUS_CODE_LATE_TECHNICAL;
      break;
    case '50':
      message = message.concat("LATE OTHER");
      state = STATUS_CODE_LATE_OTHER;
      break;
    default:
      message = message.concat("UNKNOWN");
      state = STATUS_CODE_UNKNOWN;
      break;
  }

  res.send({
    message: message
  })
})

module.exports = app;
