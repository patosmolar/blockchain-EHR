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
  var role = context.logedUserType;


  const addressHaveDeviceRegistration = async (address) =>{
    var publicKey = await context.recordsContract.getPublicKey(EthersUtils.getAddress(address));
    return publicKey.length > 10;
  };



  const loadMyData = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      var fileRaw = await getRawFileFromAddressPatient();
      var keyIVData = await extractKeyIVData(fileRaw);
      var file = await aesDecrypt(keyIVData.data, keyIVData.key, keyIVData.IV);
      var rawFileString = ab2str(file);
      var ch = rawFileString[rawFileString.length-1];
      var parsable = rawFileString.replaceAll(ch, "");
      console.log(parsable);
      context.setRecordFile(JSON.parse(parsable));
      navigate("/viewRecords/false");
    } catch (error) {
      alert("Nepodarilo sa načítať pacientovu zložku.");
    }
    setLoading(false);
  };

  const loadPatientData = async (event) =>
  {
    event.preventDefault();
    setLoading(true);
    var exists = false;
    try {
      exists = await context.recordsContract.medicalFolderExists(event.target.patientAddress.value);
    } catch (error) {
      alert(error);
    }

    if(exists === true){
      try {
        var fileRaw = await getRawFileFromAddress(event.target.patientAddress.value);
        var keyIVData = await extractKeyIVData(fileRaw);
        var file = await aesDecrypt(keyIVData.data, keyIVData.key, keyIVData.IV);
        var rawFileString = ab2str(file);
        var ch = rawFileString[rawFileString.length-1];
        var parsable = rawFileString.replaceAll(ch, "");
        context.setRecordFile(JSON.parse(parsable));
        navigate("/viewRecords/false");
      } catch (error) {
        alert("Nepodarilo sa načítať pacientovu zložku.");
      }
    }else{
      await createMedicalFolder(event.target.patientAddress.value);
    }
    
    setLoading(false);
  };

  const createMedicalFolder = async (patientAddress) =>{
    var checkRegistration = await addressHaveDeviceRegistration(patientAddress);
    if(checkRegistration === true){
      var file = new RecordFile(patientAddress);
      context.setRecordFile(file);
      navigate("/viewRecords/true");
    }else{
      alert("Pacient nemá zaregistrované zariadenie.");
    }
    setLoading(false);
  };
  
  const getRawFileFromAddressPatient = async () =>{
    let path = await context.recordsContract.getMediacalRecordPatient();
    const chunks = []
    for await (const chunk of context.ipfsClient.cat(path)) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks);
  };

  const getRawFileFromAddress = async (addr) =>{
    let address = EthersUtils.getAddress(addr);
    try {
      let path = await context.recordsContract.getMediacalRecordDoctor(address);
      const chunks = []
      for await (const chunk of context.ipfsClient.cat(path)) {
        chunks.push(chunk)
      }
      return Buffer.concat(chunks);
    } catch (error) {
      alert("Nemáte potrebné povolenie pre pacientovu zložku.");
      throw error;
    }
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

if(role ==="DOCTOR_ROLE"){
  return(
    <Container className="mt-3">
        <Row className="mt-4">
            <Col>
                <Card className="text-center">
                    <Card.Header>
                        Načítať údaje o pacientovi
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={loadPatientData}>
                            <Form.Group className="md">
                                <Form.Label>Adresa pacienta</Form.Label>
                                <Form.Control name ="patientAddress" type="text" placeholder="0x1an.." />
                            </Form.Group>
                            <Form.Group className="mt-2" >
                                <Button
                                variant="info"
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
}else if(role ==="PATIENT_ROLE"){
  return(
    <Container>
        <Card className="mt-5 w-50 m-auto justify-content-center text-center">
                    <Card.Header>
                       Načítať záznam
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={loadMyData}>
                            <Form.Group className="mt-2" >
                                <Button
                                variant="info"
                                type="submit"
                                disabled={isLoading}
                                >
                                {isLoading ? 'Načítavam...' : 'Načítať'}
                                </Button>
                            </Form.Group>
                        </Form>
                    </Card.Body>
              </Card>
    </Container>
  )
}else{
  return(
    <h2>Vitaj : {context.account}</h2>
  );
}
}
export default Home;