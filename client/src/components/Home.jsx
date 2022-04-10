import React, { useState,useEffect  } from "react";
import FileUpload from "./file-upload/file-upload.component";
import Web3 from "web3";
import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {address, abi} from "../ipfsConfig.js";
import { create } from "ipfs-http-client";
import { JSEncrypt } from "jsencrypt";

function Home() {
    const [contract, setContract] = useState({
    });
    const client = create('https://ipfs.infura.io:5001/api/v0');
    const [account, setAccount] = useState({
    });
  
    const [fileFromIPFS, setFileFromIPFS] = useState({
    });
    var encrypt = new JSEncrypt();
  
    const btnhandler = async ()  => {
     
      // Asking if metamask is already present or not
      if (window.ethereum) {
    
        const web3 = new Web3("HTTP://127.0.0.1:7545");
        const accounts = await web3.eth.getAccounts();
        const ipfs = await new web3.eth.Contract(abi, address);
        setContract(ipfs);
        setAccount(accounts[0]);
        web3.eth.getBalance(accounts[0]).then(console.log);
      } else {
        alert("install metamask extension!!");
      }
    };
  
    const updateUploadedFiles = async (files) =>
    {
      const created = await client.add(files[0]);
      encrypt.setPublicKey(account);
      const hashOfCrated = encrypt.encrypt(created.path);
      console.log(created.path);
      await contract.methods.sendHash(account, hashOfCrated).send({
        from : account
      });
    };
  
    const getHash = async () =>
    {
      const fileHash = await contract.methods.getHash(account).call({
        from : account
      });
      console.log(fileHash);
      const chunks = []
      for await (const chunk of client.cat(fileHash)) {
        chunks.push(chunk)
      }
      setFileFromIPFS(Buffer.concat(chunks).toString());
    };
  
    const handleSubmit = (event)  => {
      event.preventDefault();
      //logic to create new user...
    };
  
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <FileUpload
            accept=".txt"
            label="Text Files"
            multiple
            updateFilesCb={updateUploadedFiles}
          />
        </form>
  
        <Card className="text-center">
          <Card.Header>
            <strong>STATE: </strong>
            {account.toString()}
          </Card.Header>
          <Card.Body>
            <Button onClick={btnhandler} variant="primary">
              Connect to wallet
            </Button>
          </Card.Body>
        </Card>
  
        <Card className="text-center">
          <Card.Header>
            <strong>SUBOR: </strong>{fileFromIPFS.toString()}
          </Card.Header>
          <Card.Body>
            <Button onClick={getHash} variant="primary">
              Get Uploaded hash
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
}

export default Home;
