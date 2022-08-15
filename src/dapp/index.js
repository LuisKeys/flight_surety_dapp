
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip().mouseover();
    setTimeout(function(){ $('[data-toggle="tooltip"]').tooltip('hide'); }, 3000);
});

(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {
       
        DOM.elid('FunSeedAirlines').value = contract.owner;
        DOM.elid('sel-airline').value = 'Fun Seed Airlines';
        DOM.elid('selected-airline-address').value = contract.owner;

        contract.isOperational((error, result) => {
            display('DAPP logs', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    

        DOM.elid('submit-oracle').addEventListener('click', async () => {
            let flight = DOM.elid('flight').value;
            let selectedAirlineAddress = DOM.elid('selected-airline-address').value;
        })

        // User-submitted transaction
        DOM.elid('fund').addEventListener('click', async() => {
            let funds = DOM.elid('funds').value;
            // Write transaction
            contract.fund(funds, (error, result) => {
                display('', `Funds added`, [ { label: 'Funds added to airline: ', error: error, value: result.funds+" wei"} ]);
                display('', '', [ { label: 'Airline is active: ', value: result.active} ]);
            });
        })

        // User-submitted transaction
        DOM.elid('register-flight').addEventListener('click', async() => {
            let flight = DOM.elid('new-flight-number').value;
            let destination = DOM.elid('new-flight-destination').value;
            
            // Write transaction
            contract.registerFlight(flight, destination, (error, result) => {
                display('', 'Register new flight', [ { label: 'Info:', error: error, value: 'Flight code: '+result.flight + ' Destination: ' + result.destination} ]);
                if (!error) {
                    flightDisplay(flight, destination, result.address, result.timestamp);
                }
            });
        })

        // User-submitted transaction
        DOM.elid('buy-insurance').addEventListener('click', () => {
            let flight = DOM.elid('insurance-flight').value;
            let price = DOM.elid('insurance-price').value;
            // Write transaction
            contract.buy(flight, price, (error, result) => {
                display('', 'Bought a new flight insurance', [ { label: 'Insurance info', error: error, value: `Flight: ${result.flight}. Paid: ${result.price} wei. Passenger: ${result.passenger}`} ]);
            });
        })

        // User-submitted transaction
        DOM.elid('check-credit').addEventListener('click', () => {
            // Write transaction
            contract.getCreditToPay((error, result) => {
                if(error){
                    console.log(error);
                    let creditDisplay = DOM.elid("credit-ammount");
                    creditDisplay.value = "Error happened while getting your credit";
                } else {
                    let creditDisplay = DOM.elid("credit-ammount");
                    creditDisplay.value = result+" wei";
                }
            });
        })

        // User-submitted transaction
        DOM.elid('claim-credit').addEventListener('click', () => {
            // Write transaction
            contract.pay((error, result) => {
                if(error){
                    console.log(error);
                    alert("Error! Could not withdraw the credit.");
                } else {
                    let creditDisplay = DOM.elid("credit-ammount");
                    alert(`Successfully withdrawed ${creditDisplay.value} wei!`);
                    creditDisplay.value = "0 ethers";
                }
            });
        })

        DOM.elid('airlineDropdownOptions').addEventListener('click', (e) => {
            e.preventDefault();
            
            DOM.elid("sel-airline").value = e.srcElement.innerHTML;
            DOM.elid("selected-airline-address").value = e.srcElement.value;
        })
    });

    DOM.elid('submit-oracle').addEventListener('click', async () => {
        let flight = DOM.elid('flight').value;
        let selectedAirlineAddress = DOM.elid('selected-airline-address').value;
        
        // Write transaction
        contract.fetchFlightStatus(selectedAirlineAddress, flight, (error, result) => {
            display('', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + getTimeFromTimestamp(result.timestamp)} ]);
            let newTime = result.timestamp;
            displaySpinner();
            setTimeout(() => {
                contract.viewFlightStatus(selectedAirlineAddress, flight, (error, result) => {
                    if (!error) {
                        changeFlightStatus(flight, result, newTime);
                    }
                });
                hideSpinner();
            }, 2000);
        });
    })


})();



function getTimeFromTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString("es-ES").slice(0, -3);
}