import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button, Card, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {recordsABI, aManagerABI, accManagerAddress, medRecordsAddress} from "../contractsConfig.js";
import SmartContractsContext from "../shared/SmartContractsContext";
import { useNavigate } from "react-router-dom";
import EthersUtils from "ethers-utils";


const DOCTOR_ROLE = "DOCTOR_ROLE";
const PATIENT_ROLE = "PATIENT_ROLE";
const ADMIN_ROLE = "ADMIN_ROLE";

function Login() {
    const context = React.useContext(SmartContractsContext);
    const [isDeviceRegistered, setIsDeviceRegistered] = useState(false);
    const { ethereum } = window;
    const navigate = useNavigate();

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
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          let records = await new ethers.Contract(medRecordsAddress, recordsABI, provider);
          let accountsManager = await new ethers.Contract(accManagerAddress, aManagerABI, provider);
          records = records.connect(signer);
          accountsManager = accountsManager.connect(signer);

          let isDoc = await accountsManager.isMemberOf(ethers.utils.formatBytes32String(DOCTOR_ROLE), EthersUtils.getAddress(accounts[0]));
          if(isDoc === true){
            context.setLogedUserType(DOCTOR_ROLE);
          }else{
            let isPatient = await accountsManager.isMemberOf(ethers.utils.formatBytes32String(PATIENT_ROLE), EthersUtils.getAddress(accounts[0]));
            if(isPatient){
              context.setLogedUserType(PATIENT_ROLE);
            }else{
              let isAdmin = await accountsManager.isAdmin();
              if(isAdmin){
                context.setLogedUserType(ADMIN_ROLE);
              }else{
                //TODO
              }
            }
          }
          context.setRecordsContract(records);
          context.setAccManagerContract(accountsManager);
          context.setAccount(accounts[0]);
          navigate("/home");
        } else {
          alert("install metamask extension!!");
        }
      };

    const generateKeyPair =  async () => {
      let keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
      );
      console.log("generujem novy keypair");
      let privKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
      let publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
      localStorage.setItem("publicKey", JSON.stringify(publicKey));
      localStorage.setItem("privateKey", JSON.stringify(privKey));
      console.log(keyPair.publicKey);
      await registerDevice();
      checkIfRegistered();
      navigate("/home");
    }

    const registerDevice = async() => {
      let key = localStorage.getItem("publicKey");
      console.log(key);
      let result = await context.recordsContract
                                  .registerDevice(key);
    };
    return(
      <Container>
        <Card className="text-center mt-5">
          <Card.Header>
            <strong>Adresa: </strong>
            {context.account.toString()}
          </Card.Header>
          <Card.Body>
            <Button onClick={connectButtonHandler} variant="primary">
              Prihlásiť sa
            </Button>
          </Card.Body>     
        </Card>

        <Card className="text-center mt-5">
          <Card.Header>
            <strong>Stav registrácie zariadenia</strong>
          </Card.Header>
          <Card.Body>
          {!isDeviceRegistered ? (
                <>Zaregistrované</>
          ): (
            <Button onClick={generateKeyPair} variant="primary">
            Registrovať zariadenie
          </Button>
          )}
          </Card.Body>
        </Card>
      </Container>
    );
}

export default Login;