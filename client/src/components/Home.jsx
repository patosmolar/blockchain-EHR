import React, { useState,useEffect  } from "react";
import {Row, Col, Button, Card, Form, Container } from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import EthersUtils from "ethers-utils";
import { useNavigate } from "react-router-dom";
import { RecordFile } from "../shared/fileTemplate";
import { extractKeyIVDataFromRawFile, arrayBufferToString, aesDecrypt} from "../shared/Utils"


function Home() {
  const context = React.useContext(SmartContractsContext);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  var role = context.logedUserType;


  const loadMyData = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      var fileRaw = await getRawFileFromAddressPatient();
      var keyIVData = await extractKeyIVDataFromRawFile(fileRaw, context.privateKey);
      var file = await aesDecrypt(keyIVData.data, keyIVData.key, keyIVData.IV);
      var rawFileString = arrayBufferToString(file);
      context.setRecordFile(JSON.parse(rawFileString));
      navigate("/viewRecords/false");
    } catch (error) {
      alert("Nepodarilo sa načítať zdravotnú zložku.");
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
      alert("Zle zadaná adresa");
      event.target.patientAddress.value = "";
      setLoading(false);
      return;
    }

    if(exists === true){
      try {
        var fileRaw = await getRawFileFromAddress(event.target.patientAddress.value);
        console.log(context.privateKey);
        var keyIVData = await extractKeyIVDataFromRawFile(fileRaw, context.privateKey);
        var file = await aesDecrypt(keyIVData.data, keyIVData.key, keyIVData.IV);
        var rawFileString = arrayBufferToString(file);
        console.log(rawFileString);
        context.setRecordFile(JSON.parse(rawFileString));
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
    var checkRegistration = await context.accManagerContract.isAccountRegistered(patientAddress);
    if(checkRegistration === true){
      var file = new RecordFile(patientAddress);
      context.setRecordFile(file);
      navigate("/viewRecords/true");
    }else{
      alert("Pacient nemá registráciu.");
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