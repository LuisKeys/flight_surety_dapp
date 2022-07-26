pragma solidity ^0.4.25;

import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA CONSTANTS                                     */
    /********************************************************************************************/
    uint8 private constant  MIN_VOTE_AIRLINES = 4;                   //Multy party voting/consensus N of M, with N = 4
    uint256 public constant MAXIMUM_INSURANCE_PRICE = 1 ether;       //Max insurance price
    uint256 public constant MINIMUM_REGISTRATION_AMOUNT = 10 ether;  //Min required registration fee for new arilines

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                   // Account used to deploy contract
    bool private operational = true;                                 // Blocks all state changes throughout the contract if false
    mapping(address => bool) private authorizedCallers;              // List of callers (contracts addresses) authorized to make  calls to this contract
    mapping(address => Airline) private airlines;                    // List of registered airlines
    address[] private airlinesAddresses;                            // List of airlines addresses
    mapping(address => Passenger) private passengers;                // List of passengers
    address[] public paxs;                            // List of passengers addresses

    struct Airline {
        string name;
        bool isRegistered;
        uint8 votesCount;
        address callerAddress;
        uint256 fund;
    }

    struct Passenger {
        uint256 credit;
        mapping(string => uint256) flights;
        address callerAddress;
    }

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        authorizedCallers[contractOwner] = true;

        // 	First airline is registered when contract is deployed.
        airlines[msg.sender] = Airline({
                                            name: "Fun Seed Airlines",
                                            isRegistered: true,
                                            votesCount: 0,
                                            callerAddress: msg.sender,
                                            fund: MINIMUM_REGISTRATION_AMOUNT
                                    });        
        airlinesAddresses.push(msg.sender);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /**
    * @dev Modifier that requires the caller to be within the list of authorized callers
    */
    modifier requireIsAuthorizedCaller()
    {
        require(authorizedCallers[msg.sender] == true, "Caller is not authorized");
        _;
    }

    /**
    * @dev Modifier that requires the caller to be within the list of authorized callers
    */
    modifier requireIsNotAirlineRegistered(address caller)
    {
        require(!isAirlineRegistered(caller), "Caller is already a registered airline");
        _;
    }

    /**
    * @dev Modifier that requires that the caller is not a contract
    */
    modifier requireIsNotAContractCaller()
    {
        require(msg.sender == tx.origin, "Contracts not allowed as callers accounts");
        _;
    }

    /**
    * @dev Modifier that requires to have funds to buy
    */
    modifier requireSufficientFunds()
    {
        require(msg.value > 0, 'Insufficients funds');
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }


    /**
    * @dev Add a new authorized caller to the callers list
    */    
    function addAuthorizedCaller (address caller)
                            external
                            requireContractOwner
    {
        authorizedCallers[caller] = true;
    }

    /**
    * @dev Removes a new authorized caller to the callers list
    */    
    function removeAuthorizedCaller (address caller)
                            external
                            requireContractOwner
    {
        delete authorizedCallers[caller];
    }

    /**
    * @dev Checks if the passenger was already added to the passengers list
    */    
    function isAirlineRegistered(address caller) internal view returns(bool registered){
        for (uint256 i = 0; i < airlinesAddresses.length; i++) {
            address airlinesAddress = airlinesAddresses[i];
            if (airlinesAddress == caller) {
                return true;
            }
        }
        return false;
    }

    /**
    * @dev Checks if the passenger was already added to the passengers list
    */    
    function isPassengerRegistered(address caller) internal view returns(bool registered){
        registered = false;
        for (uint256 i = 0; i < paxs.length; i++) {
            address passengerAddress = paxs[i];
            if (passengerAddress == caller) {
                registered = true;
                break;
            }
        }
        return registered;
    }

    /**
    * @dev Checks if the airline is funded
    */    
    function isFunded (address caller) public view returns(bool) {
        return(airlines[caller].fund >= MINIMUM_REGISTRATION_AMOUNT);
    }
    
    /**
    * @dev Checks if the caller is authorized
    */    
    function isAuthorized (address caller)
                            external
                            view
                            returns(bool)
    {
        return(authorizedCallers[caller]);
    }

    /**
    * @dev Checks if the caller is authorized
    */    
    function isAirline (address caller)
                        external
                        view
                        returns (bool) 
    {
        return airlines[caller].callerAddress == caller;
    }

    /**
    * @dev Return number of registered airlines
    */    
    function airlinesRegistered ()
                        external
                        view
                        returns (uint256) 
    {
        return airlinesAddresses.length;
    }
    
    /**
    * @dev Return pax address
    */    
    function getPax (uint256 index)
                        external
                        view
                        returns (address) 
    {
        return paxs[index];
    }
    
    /**
    * @dev Return pax credit if any
    */    
    function getPaxCredit() external view returns (uint256) {
        return passengers[msg.sender].credit;
    }
    /**

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address caller, string name)
                            external                            
                            requireIsOperational
                            requireIsAuthorizedCaller
                            requireIsNotAirlineRegistered(caller)
                            returns(bool)
    {
        if(airlinesAddresses.length < MIN_VOTE_AIRLINES) {
            //While the min vote airlines number is not meet, no voting is required
            airlines[caller] = Airline({
                                        name: name,
                                        isRegistered: true,
                                        votesCount: 1,
                                        callerAddress: caller,
                                        fund: MINIMUM_REGISTRATION_AMOUNT
                                    });   
            airlinesAddresses.push(caller);
            return true;
        } else {
            //The min vote number was reached hence voting is required
            vote(caller);
            return true;
        }        
    }

   /**
    * @dev Airlines voting process (only when min vote airlines number is met)
    */   
    function vote(address newAirline) internal {
        airlines[newAirline].votesCount++;
        //50% of registered airlines need to vote for the consensus to meet the ok condition
        //This is why airlinesCount is divided by 2
        if (airlines[newAirline].votesCount >= airlinesAddresses.length.div(2)) {
            airlines[newAirline].isRegistered = true;
            airlinesAddresses.push(newAirline);
        }        
    }
    

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy(string flight)
                            external
                            payable
                            requireIsOperational
                            requireSufficientFunds
                            requireIsNotAContractCaller
    {
        
        if(!isPassengerRegistered(msg.sender)){
            if (passengers[msg.sender].callerAddress != msg.sender) {
                //Add new passenger to the list
                passengers[msg.sender] = Passenger({
                                                    callerAddress: msg.sender,
                                                    credit: 0
                                                });   
                passengers[msg.sender].flights[flight] = msg.value;
                paxs.push(msg.sender);
            }        
        } else {
            //Passenger already in the list, only add the flight
            passengers[msg.sender].flights[flight] = msg.value;
        }
        //If amount is higher than the limit, return the excess amount
        if (msg.value > MAXIMUM_INSURANCE_PRICE) {
            msg.sender.transfer(msg.value.sub(MAXIMUM_INSURANCE_PRICE));
        }
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    string flight
                                )
                                external
                                requireIsOperational
    {
        for (uint256 i = 0; i < paxs.length; i++) {
            address caller = paxs[i];
            if(passengers[caller].flights[flight] != 0) {
                uint256 payment = passengers[caller].flights[flight];
                uint256 credit = passengers[caller].credit;
                passengers[caller].flights[flight] = 0;
                //1.5 times payed back to the passenger if the ariline flight was delayed
                uint256 payback = payment + payment.div(2);
                passengers[caller].credit = credit + payback;
            }
        }
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function withdraw
                            (
                                address passenger
                            )
                            public
                            payable
                            requireIsOperational
                            returns (uint256, uint256, uint256, uint256, address, address)
    {
        require(passenger == tx.origin, "No contracts");
        require(passengers[passenger].credit > 0, "Passenger has no credit");
        uint256 credit = passengers[passenger].credit;
        uint256 balance = address(this).balance;
        require(address(this).balance > credit, "Insufficient funds");
        passengers[passenger].credit = 0;
        passenger.transfer(credit);
        uint256 finalCredit = passengers[passenger].credit;
        return (balance, credit, address(this).balance, finalCredit, passenger, address(this));
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
                            requireIsOperational
    {
        airlines[msg.sender].fund = airlines[msg.sender].fund.add(msg.value);
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }

}

