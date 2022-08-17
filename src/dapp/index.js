
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

        contract.isOperational((error, result) => {
            message('Message', 'Is contract operational?', [ { label: 'Operational Status:', error: error, value: result} ]);
        });

        DOM.elid('airlineSelector').addEventListener('click', (e) => {
            e.preventDefault();
            
            message('Action', 'Airline selected', [ { label: 'Selected:', error: null, value: e.srcElement.innerHTML} ]);
            DOM.elid("sel-airline").value = e.srcElement.innerHTML;
            DOM.elid("airline-address").value = contract.accounts[e.srcElement.value] ;
        })

        DOM.elid('check-status').addEventListener('click', async (e) => {
            let flight = DOM.elid('flight').value;
            let airlineAddress = DOM.elid('airline-address').value;            
            /*
            let timestamp = Math.floor(Date.now() / 1000); //convert ms to seconds
            contract.fetchFlightStatus(flight, (error, result) => {
                message('', 'Query oracles', [ { label: 'Flight Status:', error: error, value: result.flight + ' ' + getTimeFromTimestamp(result.timestamp)} ]);
                let time = result.timestamp;
                setTimeout(() => {
                    contract.viewFlightStatus(airlineAddress, flight, (error, result) => {
                    });
            }, 3000);
            */
                            
            /*
            e.preventDefault();
            let value = e.srcElement.value;
            const response = await fetch(`http://localhost:3000/api/status/${value}`);
            const jResponse = await response.json();
            console.log(jResponse);
            message('', 'Query oracles', [ { label: 'Flight Status:', error: error, value: jResponse.message} ]);
            */
        })

        DOM.elid('buy-insurance').addEventListener('click', () => {
            let flight = DOM.elid('flight').value;
            let price = DOM.elid('price').value;
            contract.buyInsurance(flight, price, (error, result) => {
                message('Action:', 'Buy flight insurance:', [ { label: 'Insurance:', error: error, value: `Passenger: ${result.passenger} - Flight: ${result.flight} - Paid: ${result.price} wei.`} ]);
            });
        })

        DOM.elid('check-credit').addEventListener('click', () => {
            contract.getCredit((error, result) => {
                if(error){
                    message('Action:', 'Check credit:', [ { label: 'Error:', error: error, value: `Passenger: ${contract.accounts[8]}`} ]);
                } else {
                    let credit = DOM.elid("credit");
                    credit.value = result + " wei";
                }
            });
        })

        DOM.elid('request-credit').addEventListener('click', () => {
            contract.withdraw((error, result) => {
                if(error){
                    message('Action:', 'Request credit:', [ { label: 'Error:', error: error, value: `Passenger: ${contract.accounts[8]}`} ]);
                } else {
                    let credit = DOM.elid("credit");
                    message('Action:', 'Requested credit:', [ { label: 'Success:', error: error, value: `Passenger: ${contract.accounts[8]} - Amount: ${credit.value}`} ]);
                    credit.value = "0";
                }
            });
        })        

    });

})();

function message(title, description, results) {
    let displayDiv = DOM.elid("messages");
    let section = DOM.section();
    if(title != ''){
        section.appendChild(DOM.h3(title));
    }
    section.appendChild(DOM.h4(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
}

function getTimeFromTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString("es-ES").slice(0, -3);
}