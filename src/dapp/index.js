
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

        DOM.elid('check-status').addEventListener('click', async () => {
            let flight = DOM.elid('flight').value;
            let airlineAddress = DOM.elid('airline-address').value;            
            
            let timestamp = Math.floor(Date.now() / 1000); //convert ms to seconds
            contract.fetchFlightStatus(flight, (error, result) => {
                message('', 'Query oracles', [ { label: 'Flight Status:', error: error, value: result.flight + ' ' + getTimeFromTimestamp(result.timestamp)} ]);
                let time = result.timestamp;
                setTimeout(() => {
                    contract.viewFlightStatus(airlineAddress, flight, (error, result) => {
                    });
                }, 3000);
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