import React, { useState,useEffect  } from "react";
import { Button, Card } from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import rsa from 'js-crypto-rsa';


function GetRecord() {
    const context = React.useContext(SmartContractsContext);
    const [fileFromIPFS, setFileFromIPFS] = useState({});

    const getHash = async () =>
    {
      const path =  context.fileHash.path;
    //   const fileHash = await contract.methods.getHash(account).call({
    //     from : account
    //   });
    //   console.log(fileHash);
      const chunks = []
      for await (const chunk of context.ipfsClient.cat(path)) {
        chunks.push(chunk)
      }
      const fileRaw = Buffer.concat(chunks).toString();
      const file = fileRaw.split(',');
      var buf = new ArrayBuffer(file.length); 
      var bufView = new Uint8Array(buf);
      for (var i=0, strLen=file.length; i < strLen; i++) {
        bufView[i] = file[i];
        }
      console.log(bufView);
      rsa.decrypt(bufView, 
                  context.privateKey,
                  'SHA-256').then( async(decrypted) =>{
                    var res = String.fromCharCode.apply(null, decrypted);
                    setFileFromIPFS(res);
                  });
    };


    const readFileAsArrayBuffer = (file) => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
              resolve(event.target.result);
          };
          reader.onerror = (err) => {
              reject(err);
          };
          reader.readAsArrayBuffer(file);
      });
  };

    return(
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
    );
}

export default GetRecord;