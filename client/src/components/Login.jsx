import React, { useState } from "react";
import { ethers } from "ethers";
import { Button, Card, Container } from "react-bootstrap";
import {recordsABI, aManagerABI, accManagerAddress, medRecordsAddress} from "../contractsConfig.js";
import SmartContractsContext from "../shared/SmartContractsContext";
import { useNavigate } from "react-router-dom";
import EthersUtils from "ethers-utils";

function Login() {
    const context = React.useContext(SmartContractsContext);
    const [isDeviceRegistered, setIsDeviceRegistered] = useState(true);
    const { ethereum } = window;
    const navigate = useNavigate();

    const checkIfRegistered = (account) => {
      var keys = localStorage.getItem(account);
      if(keys != undefined){
          keys = JSON.parse(keys);
          context.setPublicKey(JSON.parse(keys.publicKey));
          context.setPrivateKey(JSON.parse(keys.privateKey));
          setIsDeviceRegistered(true);
          navigate("/home");
         } else{
          setIsDeviceRegistered(false);
         }
    }
    
    const connectButtonHandler = async ()  => {
      // Asking if metamask is already present or not
      if (window.ethereum) {
        const accounts  = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        try {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          let records = await new ethers.Contract(medRecordsAddress, recordsABI, provider);
          let accountsManager = await new ethers.Contract(accManagerAddress, aManagerABI, provider);
          records = records.connect(signer);
          accountsManager = accountsManager.connect(signer);
          try {
            await accountsManager.isAdmin();
            context.setLogedUserType("ADMIN_ROLE");
          }catch(error){
            const isDoc = await accountsManager.isMemberOf(ethers.utils.formatBytes32String("DOCTOR_ROLE"), EthersUtils.getAddress(accounts[0]));
            if(isDoc === true){
              context.setLogedUserType("DOCTOR_ROLE");
            }else{
              let isPatient = await accountsManager.isMemberOf(ethers.utils.formatBytes32String("PATIENT_ROLE"), EthersUtils.getAddress(accounts[0]));
              if(isPatient === true){
                context.setLogedUserType("PATIENT_ROLE");
              }else{
                throw "Účet nie je zaregistrovaný";
              }
            }
          }
          context.setRecordsContract(records);
          context.setAccManagerContract(accountsManager);
          context.setAccount(accounts[0]);
          checkIfRegistered(accounts[0]);
        } catch (error) {
          alert(error);
        }
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
      let privKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
      let publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
      const storable = {
        "account":context.account,
        "privateKey":JSON.stringify(privKey),
        "publicKey":JSON.stringify(publicKey)
      };
      localStorage.setItem(context.account, JSON.stringify(storable));
      await registerDevice();
      checkIfRegistered(context.account);
    }

    const registerDevice = async() => {
      let keys = localStorage.getItem(context.account);
      keys = JSON.parse(keys);
      await context.recordsContract
                                  .registerDevice(keys.publicKey.toString());
    };

    if(isDeviceRegistered){
      return(
        <Container className="w-50 ">
          <Card className="text-center mt-5 blue lighten-5">
            <Card.Header>
              <strong>Účet neprihlásený, prosím prihláste sa</strong>
              {context.account.toString()}
            </Card.Header>
            <Card.Body >
              <Button variant="info" onClick={connectButtonHandler}>
                Prihlásiť sa
              </Button >
            </Card.Body>     
          </Card>
        </Container>
      );
    }else{
      return(
      <Container>
        <Card className="text-center mt-5 blue lighten-5">
          <Card.Header>
            <strong>Zaregistrovať zariadenie pre účet {context.account}</strong>
          </Card.Header>
          <Card.Body>
            <Button variant="info" onClick={generateKeyPair}>
            Registrovať zariadenie
          </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default Login;