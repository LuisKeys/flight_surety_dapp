
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
        });

        DOM.elid('airlineSelector').addEventListener('click', (e) => {
            e.preventDefault();
            console.log(e);
            DOM.elid("sel-airline").value = e.srcElement.innerHTML;
            DOM.elid("airline-address").value = contract.accounts[e.srcElement.value] ;
        })

    });

})();
