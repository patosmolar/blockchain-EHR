import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button, Card, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {recordsABI, aManagerABI, accManagerAddress, medRecordsAddress} from "../contractsConfig.js";
import SmartContractsContext from "../shared/SmartContractsContext";
import rsa from 'js-crypto-rsa';

function Login() {
    const context = React.useContext(SmartContractsContext);
    const [isDeviceRegistered, setIsDeviceRegistered] = useState(false);
    const { ethereum } = window;

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
          
          const accounts  = await window.ethereum.request({
            method: "eth_requestAccounts",
          })
          console.log(accounts);
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          let records = await new ethers.Contract(medRecordsAddress, recordsABI, provider);
          let accountsManager = await new ethers.Contract(accManagerAddress, aManagerABI, provider);
          records = records.connect(signer);
          accountsManager = accountsManager.connect(signer);
          context.setRecordsContract(records);
          context.setAccManagerContract(accountsManager);
          context.setAccount(accounts[0]);
        } else {
          alert("install metamask extension!!");
        }
      };

    const generateKeyPair =  async () => {
      rsa.generateKey(2048).then( async (key) => {
        console.log("generujem novy keypair");
        localStorage.setItem("publicKey", JSON.stringify(key.publicKey));
        localStorage.setItem("privateKey", JSON.stringify(key.privateKey));
        await registerDevice();
        checkIfRegistered();
      })
    }

    const registerDevice = async() => {
      let key = localStorage.getItem("publicKey");
      console.log(key);
      let result = await context.recordsContract
                                  .registerDevice(key);
      console.log(result);
    };
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
          {!isDeviceRegistered ? (
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