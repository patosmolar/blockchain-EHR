import React, { useState,useEffect  } from "react";
import FileUpload from "./file-upload/file-upload.component";
import Web3 from "web3";
import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {recordsABI, aManagerABI, accManagerAddress, medRecordsAddress} from "../contractsConfig.js";
import { create } from "ipfs-http-client";
import { JSEncrypt } from "jsencrypt";

function OHome() {
    

    const ipfsClient = create('https://ipfs.infura.io:5001/api/v0');
  
    const [fileFromIPFS, setFileFromIPFS] = useState();
    var encrypt = new JSEncrypt();
  
    
  
    const updateUploadedFiles = async (files) =>
    {
      const created = await ipfsClient .add(files[0]);
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

export default OHome;
