const Config = require("./config.json");
const Web3 = require("web3");
const express = require("express");
const FlightSuretyData = require("../../build/contracts/FlightSuretyData.json");
const FlightSuretyApp = require("../../build/contracts/FlightSuretyApp.json");
const cors = require('cors');

let config = Config["localhost"];
let web3 = new Web3(
  new Web3.providers.WebsocketProvider(config.url.replace("http", "ws"))
);
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyData = new web3.eth.Contract(
  FlightSuretyData.abi,
  config.dataAddress
);
let flightSuretyApp = new web3.eth.Contract(
  FlightSuretyApp.abi,
  config.appAddress
);

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
app.use(cors());

app.get("/api", (req, res) => {
  res.send({
    message: "API Server listener here :)",
  });
});

app.get("/api/status", (req, res) => {
  var status = req.query.status;
  console.log("Check status id:", status);

  var message = "Status changed to: ";
  switch (status) {
    case "10":
      message = message.concat("ON TIME");
      state = STATUS_CODE_ON_TIME;
      break;
    case "20":
      message = message.concat("LATE AIRLINE");
      state = STATUS_CODE_LATE_AIRLINE;
      break;
    case "30":
      message = message.concat("LATE WEATHER");
      state = STATUS_CODE_LATE_WEATHER;
      break;
    case "40":
      message = message.concat("LATE TECHNICAL");
      state = STATUS_CODE_LATE_TECHNICAL;
      break;
    case "50":
      message = message.concat("LATE OTHER");
      state = STATUS_CODE_LATE_OTHER;
      break;
    default:
      message = message.concat("UNKNOWN");
      state = STATUS_CODE_UNKNOWN;
      break;
  }

  res.send({
    message: message,
  });
});

fetchOracles().then((accounts) => {
  init(accounts).catch((err) => {
    console.log(err.message);
  });
});

function fetchOracles() {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts().then((accounts) => {
        oracles = accounts.slice(10, 10 + INSTANCES);
        console.log("Oracles:");
        console.log(oracles);
      })
      .catch((err) => {
        reject(err);
      })
      .then(() => {
        resolve(oracles);
      });
  });
}

function init(accounts) {
  return new Promise((resolve, reject) => {
    flightSuretyApp.methods.REGISTRATION_FEE().call().then((fee) => {

        for (let i = 0; i < INSTANCES; i++) {

          flightSuretyApp.methods.registerOracle().send({
              from: accounts[i],
              value: fee,
              gas: 1000000,
              gasPrice: 10000000,
            }).then(() => {
              flightSuretyApp.methods.getMyIndexes().call({from: accounts[a],}).then((result) => {
                  ixs.push(result);
                  console.log(`Oracle ${a} - account ${accounts[a]} - ixs [${result}].`);
                })
                .catch((err) => {
                  reject(err);
                });
            })
            .catch((err) => {
              reject(err);
            });
        }
        resolve(ixs);

      })
      .catch((err) => {
        reject(err);
      });
  });
}

flightSuretyApp.events.OracleRequest(
  {
    fromBlock: "latest",
  },

  function (error, event) {
    if (error) {
      console.log(error);
    }
    console.log(event);
    let index = event.returnValues.index;
    console.log(`Index: ${index}`);
    let idx = 0;

    ixs.forEach((indexes) => {
      let oracle = oracles[idx];
      console.log(`Oracle: ${oracle} triggered. Indexes: ${indexes}.`);
      submit(
        oracle,
        index,
        event.returnValues.airline,
        event.returnValues.flight,
        event.returnValues.timestamp
      );
      idx++;
    });
  }
);

flightSuretyData.events.allEvents(
  {
    fromBlock: "latest",
  },
  function (error, event) {
    if (error) {
      console.log("error");
      console.log(error);
    } else {
      console.log("event:");
      console.log(event);
    }
  }
);

function submit(oracle, index, airline, flight, timestamp) {

  const payload = {
    index: index,
    airline: airline,
    flight: flight,
    statusCode: state,
    timestamp: timestamp
  };

  flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, state).send(
      { from: oracle, gas: 1000000, gasPrice: 10000000 },
      (error, result) => {
        if (error) {
          console.log("Error:", error);
          console.log("Payload:", payload);
        }
      }
    );

  if (state == STATUS_CODE_LATE_AIRLINE) {
    flightSuretyData.methods.creditInsurees(flight).call({ from: oracle }, (error, result) => {
        if (error) {
          console.log("Error:", error);
          console.log("Payload:", payload);
        } else {
          console.log("Credit");
          console.log("Result:", result);
        }
      });
  }
}

module.exports = app;
