import React, { useState,useEffect  } from "react";
import {Row, Col, Button, Card, Form, Container } from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import EthersUtils from "ethers-utils";
import { useNavigate } from "react-router-dom";
import { RecordFile } from "../shared/fileTemplate";


function Home() {
  const context = React.useContext(SmartContractsContext);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  console.log(context.logedUserType);

  const createNewRecord = (event) =>{
    event.preventDefault();
    var file = new RecordFile(event.target.patientAddress.value);
    context.setRecordFile(file);
    navigate("/viewRecords/true");
  }

  const loadPatientData = async (event) =>
  {
    event.preventDefault();
    setLoading(true);
    var fileRaw = await getRawFileFromAddress(event.target.patientAddress.value);
    var keyIVData = await extractKeyIVData(fileRaw);
    var file = await aesDecrypt(keyIVData.data, keyIVData.key, keyIVData.IV);
    var rawFileString = ab2str(file);
    var ch = rawFileString[rawFileString.length-1];
    var parsable = rawFileString.replaceAll(ch, "");
    console.log(parsable);
    context.setRecordFile(JSON.parse(parsable));
    setLoading(false);
    navigate("/viewRecords/false");
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
    <Container>
        <Row className="mt-4">
            <Col>
                <Card className="text-center">
                    <Card.Header>
                        Načítať údaje o pacientovi {"0x2C9353499784c1D3BBA16648903BAa030d3452f1"}
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={loadPatientData}>
                            <Form.Group className="md">
                                <Form.Label>Adresa pacienta</Form.Label>
                                <Form.Control name ="patientAddress" type="text" placeholder="0x1an.." />
                            </Form.Group>
                            <Form.Group className="mt-2" >
                                <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                                >
                                {isLoading ? 'Načítavam...' : 'Načítať'}
                                </Button>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
            <Card className="text-center">
                    <Card.Header>
                        Vytvoriť záznam pre nového pacienta {"0x2C9353499784c1D3BBA16648903BAa030d3452f1"}
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={createNewRecord}>
                            <Form.Group className="md">
                                <Form.Label>Adresa pacienta</Form.Label>
                                <Form.Control name ="patientAddress" type="text" placeholder="0x1an.." />
                            </Form.Group>
                            <Form.Group className="mt-2" >
                                <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                                >
                                {isLoading ? 'Načítavam...' : 'Načítať'}
                                </Button>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            
            </Col>

        </Row>
        

    </Container>
    
  );
}

export default Home;