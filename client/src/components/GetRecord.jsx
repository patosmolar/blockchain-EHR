import React, { useState,useEffect  } from "react";
import {Form, Button, Card } from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import EthersUtils from "ethers-utils";


function GetRecord() {
  const context = React.useContext(SmartContractsContext);
  const [isLoading, setLoading] = useState(false);
  const [fileFromIPFS, setFileFromIPFS] = useState({});
  let encoder = new TextEncoder();

  const getHash = async () =>
  {
    setLoading(true);
    var fileRaw = await getRawFileFromAddress("0x2C9353499784c1D3BBA16648903BAa030d3452f1");
    var keyIVData = await extractKeyIVData(fileRaw);
    console.log(keyIVData);
    var file = await aesDecrypt(keyIVData.data, keyIVData.key, keyIVData.IV);
    var rawFileString = ab2str(file);
    var ch = rawFileString[rawFileString.length-1];
    var parsable = rawFileString.replaceAll(ch, "");
    console.log(parsable);
    console.log(JSON.parse(parsable));
    setLoading(false);
  };

  const getRawFileFromAddress = async (addr) =>{
    let address = EthersUtils.getAddress(addr);
    let path = await context.recordsContract.getMediacalRecordDoctor(address);
    const chunks = []
    for await (const chunk of context.ipfsClient.cat(path)) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks);
  };

  const str2ab = (str) => {
    const buffer = new ArrayBuffer(str.length * 2);
    const bufferInterface = new Uint8Array(buffer);
    Array.from(str)
      .forEach((_, index) => bufferInterface[index] = str.charCodeAt(index));
    return buffer;
  };

  const ab2str = (buffer) =>{
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
  };

  const extractKeyIVData = async (fileRaw) =>{
    let rawIV = fileRaw.slice(0, 12);
    let rawKey = fileRaw.slice(12, 268);
    var privKey = await importRSAKey(context.privateKey);

    var decryptedKeyExp = await rsaDecrypt(rawKey, privKey);
    var k = JSON.parse(ab2str(decryptedKeyExp));
    console.log(k);
    var impKey = await importAESKey(k);
    var data = fileRaw.slice(268,fileRaw.length);
    return {"key":impKey, "IV":rawIV, "data":data};
  };

  const importRSAKey = async (privateKey) =>{
    return await window.crypto.subtle.importKey("jwk",
                                    privateKey,
                                    {
                                    name: "RSA-OAEP",
                                    modulusLength: 2048,
                                    publicExponent: new Uint8Array([1, 0, 1]),
                                    hash: "SHA-256"
                                },
                                true,
                                ["decrypt"]);
  };

  const importAESKey = async (rawKey) =>{
    return await window.crypto.subtle.importKey(
      "jwk",
      rawKey,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"]
    );
  };


  const rsaDecrypt = async (cipher, privateKey) =>{
      return await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP"
        },
        privateKey,
        cipher
      );
  };

  const aesDecrypt = async (message, key, iv) =>{
    var algoEncrypt = {
        name: 'AES-GCM',
        iv: iv
      };
   return await window.crypto.subtle
                        .decrypt(algoEncrypt, key, message);
};


  return(
    <>
    <Card className="text-center">
      <Card.Header>
        <strong>SUBOR: </strong>{fileFromIPFS.toString()}
      </Card.Header>
      <Card.Body>
      <Button
        variant="primary"
        disabled={isLoading}
        onClick={getHash}
        >
        {isLoading ? 'Nahrávam...' : 'Potvrdiť'}
        </Button>
      </Card.Body>
    </Card>
    </>
  );
}

export default GetRecord;