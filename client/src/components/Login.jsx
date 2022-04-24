import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { Button, Card, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {recordsABI, aManagerABI, accManagerAddress, medRecordsAddress} from "../contractsConfig.js";
import SmartContractsContext from "../shared/SmartContractsContext";
import rsa from 'js-crypto-rsa';

function Login() {
    const context = React.useContext(SmartContractsContext);
    const [isDeviceRegistered, setIsDeviceRegistered] = useState(false);

    const checkIfRegistered = () => {
      if(localStorage.getItem("publicKey") != undefined && 
         localStorage.getItem("privateKey") != undefined){
          context.setPublicKey(JSON.parse(localStorage.getItem("publicKey")));
          context.setPrivateKey(JSON.parse(localStorage.getItem("privateKey")));
          setIsDeviceRegistered(true);
         } else{
          setIsDeviceRegistered(false);
         }
    }
    
    useEffect(() => {
      checkIfRegistered();
   },[]);

    const connectButtonHandler = async ()  => {
        // Asking if metamask is already present or not
        if (window.ethereum) {
      
          const web3 = new Web3("HTTP://127.0.0.1:7545");
          const accounts = await web3.eth.getAccounts();
          const records = await new web3.eth.Contract(recordsABI, medRecordsAddress);
          const accountsManager = await new web3.eth.Contract(aManagerABI, accManagerAddress);
          context.setRecordsContract(records);
          context.setAccManagerContract(accountsManager);
          context.setAccount(accounts[0]);
          web3.eth.getBalance(accounts[0]).then(console.log);
        } else {
          alert("install metamask extension!!");
        }
      };

    const generateKeyPair =  ()  => {
      rsa.generateKey(2048).then( (key) => {
        console.log("generujem novy keypair");
        localStorage.setItem("publicKey", JSON.stringify(key.publicKey));
        localStorage.setItem("privateKey", JSON.stringify(key.privateKey));
        checkIfRegistered();
      })
    }

    return(
      <Container>
        <Card className="text-center">
          <Card.Header>
            <strong>Address: </strong>
            {context.account.toString()}
          </Card.Header>
          <Card.Body>
            <Button onClick={connectButtonHandler} variant="primary">
              Connect to wallet
            </Button>
          </Card.Body>     
        </Card>

        <Card className="text-center">
          <Card.Header>
            <strong>Device registration status: {isDeviceRegistered.toString()}  </strong>
          </Card.Header>
          <Card.Body>
          {isDeviceRegistered ? (
                <>{localStorage.getItem("publicKey")}</>
          ): (
            <Button onClick={generateKeyPair} variant="primary">
            Generate key-pair
          </Button>
          )}
          </Card.Body>
        </Card>
      </Container>
    );
}

export default Login;