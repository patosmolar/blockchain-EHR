import React, { useState,useEffect  } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Row,Collapse, Container, Col} from "react-bootstrap";
import rsa from 'js-crypto-rsa';
import SmartContractsContext from "../shared/SmartContractsContext";
import EthersUtils from "ethers-utils";
import { recordTemplate, dataTemplate } from "../shared/fileTemplate";
import crypto from 'crypto';


function AddRecordData() {
    const [open, setOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const context = React.useContext(SmartContractsContext);
    let encoder = new TextEncoder();
    


    const getPublicKeys = async (address) => {
        let addr = EthersUtils.getAddress(address);
        let result = await context.recordsContract
                                .getPublicKey(addr);
        return JSON.parse(result);
    }

    const fillData = (form) =>{
        let newData = dataTemplate;
        newData.date = new Date().toLocaleString();
        newData.doctorId = "NEVIEMESTEID";
        newData.title = form.title.value;
        newData.data = form.recordData.value;
        context.recordFile.recentRecordUpdate = new Date().toLocaleString();
        context.recordFile.records.push(newData);
    };

    const uploadFile = async (event)  => {
        event.preventDefault();
        setLoading(true);
        let form = event.target;
        fillData(form);
        const myPublic = context.publicKey;
        const patientsPublic = await getPublicKeys("0x2C9353499784c1D3BBA16648903BAa030d3452f1");
        let fileString = JSON.stringify(context.recordFile);
        let myEncFile = await stringToEncryptedFile(fileString, myPublic);
        let patientEncFile = await stringToEncryptedFile(fileString,patientsPublic);

        const myFileHash = await context.ipfsClient.add(myEncFile);
        console.log(myFileHash.path);
        const patientsFileHash = await context.ipfsClient.add(patientEncFile);
        console.log(patientsFileHash.path);
        const result = await context.recordsContract.addMedicalRecord(EthersUtils.getAddress("0x2C9353499784c1D3BBA16648903BAa030d3452f1"),
                                                                        myFileHash.path,
                                                                        patientsFileHash.path,
                                                                        context.account);
        console.log(result);
        setLoading(false);
    };

    const importKey = async (publicKeyRaw) =>{
        return await window.crypto.subtle.importKey("jwk", 
                                        publicKeyRaw,
                                        {
                                        name: "RSA-OAEP",
                                        modulusLength: 2048,
                                        publicExponent: new Uint8Array([1, 0, 1]),
                                        hash: "SHA-256"
                                    },
                                    true,
                                    ["encrypt"]);
    };

    const rsaEncrypt = async (message, publicKey) =>{
        let encodedMessage = encoder.encode(message);
        return await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            publicKey,
            encodedMessage
            );
    };

    const getAESKeyIV = async () => {
        const algoKeyGen = {
            name: 'AES-GCM',
            length: 256
          };
        const keyUsages = [
        'encrypt',
        'decrypt'
        ];
        var key = await window.crypto.subtle.generateKey(algoKeyGen, true, keyUsages);
        var iv = window.crypto.getRandomValues(new Uint8Array(12));

        let res = {
            "iv":iv,
            "key":key
        };
        return res;
    };

    const aesEncrypt = async (message, key, iv) =>{
        var algoEncrypt = {
            name: 'AES-GCM',
            iv: iv,
            tagLength: 128
          };
       return await window.crypto.subtle
                            .encrypt(algoEncrypt, key, str2ab(message));
    };


    const exportAESKeyString = async (key) =>{
        const exported =  await window.crypto.subtle.exportKey(
            "jwk",
            key
          );
        return JSON.stringify(exported);
    };
    const stringToEncryptedFile = async (fileString, publicKeyRaw)  => {
        var aesKeyIV = await getAESKeyIV();

        var cipherText = await aesEncrypt(fileString, aesKeyIV.key, aesKeyIV.iv);

        let publicKey = await importKey(publicKeyRaw);
        
        var exportedKey = await exportAESKeyString(aesKeyIV.key);
        let encryptedKey = await rsaEncrypt(exportedKey, publicKey);
        console.log(aesKeyIV.iv);
        var fileToUpload = new File([aesKeyIV.iv,encryptedKey,cipherText], "foo.txt", {
            type: "text/plain",
            });
        return fileToUpload;
    };  
    
      const ab2str = (buffer) =>{
        return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
    };
    const str2ab = (str) => {
        const buffer = new ArrayBuffer(str.length * 2);
        const bufferInterface = new Uint8Array(buffer);
        Array.from(str)
          .forEach((_, index) => bufferInterface[index] = str.charCodeAt(index));
        return buffer;
      };

    return(
        <Container>
            <Row>
                <Button variant="info"
                    onClick={() => setOpen(!open)}
                    aria-controls="patient-header-info"
                    aria-expanded={open}
                >
                    Header info
                </Button>
                <Collapse in={open}>
                    <Container>
                        <Row>
                            <Col>
                            {context.recordFile.name}
                            </Col>
                            <Col>
                            {context.recordFile.lastName}
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                            {context.recordFile.birthDate}
                            </Col>
                            <Col>
                            {context.recordFile.bloodType}
                            </Col>
                        </Row>
                    </Container>
                </Collapse>
            </Row>
        


        <Form onSubmit={uploadFile} className="justify-content-center m-auto mt-2">
        <p> {"0x2C9353499784c1D3BBA16648903BAa030d3452f1"}</p>
            <Row>
                <Col>
                    <Form.Group className="md">
                        <Form.Label>Adresa pacienta</Form.Label>
                        <Form.Control name ="patientAddress" type="text" placeholder="0x1an.." />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="md">
                        <Form.Label>Title</Form.Label>
                    <Form.Control name ="title" type="text" placeholder="Preventívna prehliadka.." />
                    </Form.Group>
                </Col>
            </Row>


            <Row>
                <Form.Group className="mb-3">
                    <Form.Label> Záznam </Form.Label>
                    <Form.Control name ="recordData" as="textarea" rows={15} />
                </Form.Group>
            </Row>

            <Form.Group className="" >
                <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                >
                {isLoading ? 'Nahrávam...' : 'Potvrdiť'}
                </Button>
            </Form.Group>
        </Form>
        
        </Container>
    );
}

export default AddRecordData;