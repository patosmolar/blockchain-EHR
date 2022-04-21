import React, { useEffect, useState } from "react";
import FileUpload from "./file-upload/file-upload.component";
import Web3 from "web3";
import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {recordsABI, aManagerABI, accManagerAddress, medRecordsAddress} from "../contractsConfig.js";
import { create } from "ipfs-http-client";
import { JSEncrypt } from "jsencrypt";

function Login() {
    const [recordsContract, setRecordsContract] = useState();
    const [accManagerContract, setAccManagerContract] = useState();
    const [account, setAccount] = useState("");

    const connectButtonHandler = async ()  => {
     
        // Asking if metamask is already present or not
        if (window.ethereum) {
      
          const web3 = new Web3("HTTP://127.0.0.1:7545");
          const accounts = await web3.eth.getAccounts();
          const records = await new web3.eth.Contract(recordsABI, medRecordsAddress);
          const accountsManager = await new web3.eth.Contract(aManagerABI, accManagerAddress);
          setRecordsContract(records);
          setAccManagerContract(accountsManager);
          setAccount(accounts[0]);
          web3.eth.getBalance(accounts[0]).then(console.log);
        } else {
          alert("install metamask extension!!");
        }
      };


    return(
        <Card className="text-center">
        <Card.Header>
          <strong>STATE: </strong>
          {account.toString()}
        </Card.Header>
        <Card.Body>
          <Button onClick={connectButtonHandler} variant="primary">
            Connect to wallet
          </Button>
        </Card.Body>
      </Card>
    );
}

export default Login;
