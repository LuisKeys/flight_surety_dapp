
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
        //DOM.elid('selected-airline-address').value = contract.owner;

        contract.isOperational((error, result) => {
            display('DAPP logs', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    
        DOM.elid('airlineSelector').addEventListener('click', (e) => {
            e.preventDefault();
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            //DOM.elid("sel-airline").value = e.innerHTML;
            //DOM.elid("airline-address").value = e.value;
        })

        DOM.elid('buy-insurance').addEventListener('click', () => {
            let flight = DOM.elid('flight').value;
            let price = DOM.elid('price').value;
            // Write transaction
            contract.buy(flight, price, (error, result) => {
                
            });
        })

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
    });

    DOM.elid('check-status').addEventListener('click', async () => {
        let flight = DOM.elid('flight').value;
        let selectedAirlineAddress = DOM.elid('airline-address').value;
        
        contract.fetchFlightStatus(selectedAirlineAddress, flight, (error, result) => {
            let newTime = result.timestamp;
        });
    })


})();



function getTimeFromTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString("es-ES").slice(0, -3);
}