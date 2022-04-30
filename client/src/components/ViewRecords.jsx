import React, { useState,useEffect  } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {Row, Col, Button, Card, Form, Container, Carousel } from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import {RecordData} from "../shared/fileTemplate";
import { useParams } from "react-router-dom";
import EthersUtils from "ethers-utils";
import crypto from 'crypto';

function ViewRecords() {
    const context = React.useContext(SmartContractsContext);
    const {isNew} = useParams();
    const [disabled, setDisabled] = useState(isNew === "false");
    const [isCreatingRecord, setIsCreatingRecord] = useState(false);
    const [file, setFile] = useState({ ...context.recordFile});
    const [newRecordData, setNewRecordData] = useState({...new RecordData("DOCTORID","","")});
    let encoder = new TextEncoder();

    const changeEdit = () =>{
        setDisabled(disabled ? false:true);
    };

    const addRecord = () => {
        if(isCreatingRecord){
            if(newRecordData.data !== "" && newRecordData.title !== ""){
                file.records.unshift(newRecordData);
                setDisabled(true);
            }
        }else{
            setNewRecordData(new RecordData("DOCTORID","",""));
        }
        setIsCreatingRecord(isCreatingRecord ? false:true);
    };

    const handleSubmit = (event) =>{
        event.preventDefault();
        uploadFile();
    };
    
    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;   
        setFile(prev => ({
            ...prev,
            [key]: value
          }));
      };

    const handleChangeNewRecord = (e) => {
        const key = e.target.name;
        const value = e.target.value;   
        setNewRecordData(prev => ({
            ...prev,
            [key]: value
            }));
    };

    const getPublicKeys = async (address) => {
        let addr = EthersUtils.getAddress(address);
        let result = await context.recordsContract
                                .getPublicKey(addr);
        return JSON.parse(result);
    }

    const uploadFile = async ()  => {
        const myPublic = context.publicKey;
        const patientsPublic = await getPublicKeys(file.address);
        let fileString = JSON.stringify(file);
        console.log(fileString);
        let myEncFile = await stringToEncryptedFile(fileString, myPublic);
        let patientEncFile = await stringToEncryptedFile(fileString,patientsPublic);

        const myFileHash = await context.ipfsClient.add(myEncFile);
        console.log(myFileHash.path);
        const patientsFileHash = await context.ipfsClient.add(patientEncFile);
        console.log(patientsFileHash.path);
        const result = await context.recordsContract.addMedicalRecord(EthersUtils.getAddress(file.address),
                                                                        myFileHash.path,
                                                                        patientsFileHash.path,
                                                                        context.account);
        console.log(result);
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
    return (
    <Container>
        <Form onSubmit={handleSubmit} className="justify-content-center m-auto mt-2">
            <Row className="mt-2">
                <Col>
                    <Form.Group className="xs-3">
                        <Form.Label>Meno</Form.Label>
                        <Form.Control disabled={disabled} value={file.name} onChange={handleChange} name="name" type="text" />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="xs-3">
                        <Form.Label>Priezvisko</Form.Label>
                        <Form.Control disabled={disabled} value={file.lastName} onChange={handleChange}  name="lastName" type="text"/>
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mt-2">
                <Col>
                    <Form.Group className="xs-3">
                        <Form.Label>Dátum narodenia</Form.Label>
                        <Form.Control disabled={disabled} value={file.birthDate} onChange={handleChange} name="birthDate" type="date"/>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="xs-3">
                        <Form.Label>Krvná skupina</Form.Label>
                        <Form.Control disabled={disabled} value={file.bloodType} onChange={handleChange} name="bloodType" type="text" />
                    </Form.Group>
                </Col>
            </Row> 

            <Row className="mt-2">
                <Col>
                    <Button
                        onClick={changeEdit}
                    >
                        {disabled? "Povoliť editovanie":"Uložiť zmeny"}
                    </Button>
                </Col>
                <Col>
                </Col>
                <Col>
                    <Button
                    type="submit"
                    >
                        Odoslať zmeny
                    </Button>
                </Col>

                <Col>
                    <Button
                        onClick={addRecord}
                    >
                        {!isCreatingRecord? "Pridať záznam":"Uložiť nový záznam"}
                    </Button>
                </Col>
            </Row>
            
            <Row className="mt-5">
                {!isCreatingRecord? 
                <Carousel interval={null} wrap={false}>
                    {file.records.map(item =>{
                        return(
                        <Carousel.Item key={Math.random()}>
                                <Row>
                                    <Col>
                                        <Form.Group className="md">
                                            <Form.Label>Title</Form.Label>
                                        <Form.Control value={item.title} onChange={handleChange} disabled={disabled} name ="title" type="text"/>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Form.Group className="mb-3">
                                        <Form.Label> Záznam </Form.Label>
                                        <Form.Control value={item.data} onChange={handleChange} disabled={disabled} name ="recordData" as="textarea" rows={15} />
                                    </Form.Group>
                                </Row>
                        </Carousel.Item>
                        );
                    })}
                </Carousel>
                :<>
                <Row>
                    <Col>
                        <Form.Group className="md">
                            <Form.Label>Title</Form.Label>
                        <Form.Control value={newRecordData.title} onChange={handleChangeNewRecord} name ="title" type="text"/>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Form.Group className="mb-3">
                        <Form.Label> Záznam </Form.Label>
                        <Form.Control value={newRecordData.data} onChange={handleChangeNewRecord} name ="data" as="textarea" rows={15} />
                    </Form.Group>
                </Row>
                </>}
            </Row>
        </Form>
    </Container>
    );
}

export default ViewRecords;