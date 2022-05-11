import React, { useState,useEffect  } from "react";
import {Row, Col, Button, Card, Form, Container, Carousel } from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import {RecordData} from "../shared/fileTemplate";
import { useParams,useNavigate } from "react-router-dom";
import {utils} from "ethers";
import { generateAESKeyIV, aesEncrypt, importRSAKeyPublic, exportAESKeyString , rsaEncrypt  } from "../shared/Utils"

function ViewRecords() {
    const context = React.useContext(SmartContractsContext);
    const [mainFileOwner, setMainFileOwner] = useState(context.account);
    const {isNew} = useParams();
    const [disabled, setDisabled] = useState(isNew === "false");
    const [isCreatingRecord, setIsCreatingRecord] = useState(false);
    const [isFolderEditable, setIsFileEditable] = useState(isNew === "true");
    const [file, setFile] = useState({ ...context.recordFile});
    const [newRecordData, setNewRecordData] = useState({...new RecordData("DOCTORID","","")});
    var role = context.logedUserType;
    const navigate = useNavigate();


    useEffect(() => {
        async function getEditableStatus() {
            const isEditable = await context.recordsContract.getFolderEditState(utils.getAddress(file.address));
            setIsFileEditable(isEditable);
        }
        if(isNew === "false"){
            getEditableStatus();
        }
     }, [])


    const handleSubmit = (event) =>{
        event.preventDefault();
        if(isFolderEditable === true){
            uploadFile();
        }else{
            alert("Užívateľ zakázal editovanie.")
        }
    };

    const uploadFile = async ()  => {
        try {
            const myPublic = await getPublicKey(mainFileOwner);
            const patientsPublic = await getPublicKey(file.address);
            let fileString = JSON.stringify(file);
            let myEncFile = await stringToEncryptedFile(fileString, myPublic);
            console.log(myEncFile);

            let patientEncFile = await stringToEncryptedFile(fileString,patientsPublic);

            const myFileHash = await context.ipfsClient.add(myEncFile);
            const patientsFileHash = await context.ipfsClient.add(patientEncFile);
            if(isNew === "true"){
                try {
                    await context.recordsContract.addMedicalFolder(utils.getAddress(file.address),
                                                                            myFileHash.path,
                                                                            patientsFileHash.path,
                                                                            mainFileOwner);
                } catch (error) {
                    alert("Užívateľ už vlastní zložku")
                }
            }else{
                try{
                    await context.recordsContract.updateMedicalFolder(utils.getAddress(file.address),
                                                                        myFileHash.path,
                                                                        patientsFileHash.path,
                                                                        mainFileOwner);
                }catch(error){
                    if(error.data.includes("Not mainFile owner")){
                        alert("Niemáte práva pre editovanie zložky pacienta");
                    }
                    else if(error.data.includes("Folder not editable")){
                        alert("Vlastník zakázal editáciu zložky.")
                    }
                    throw error;
                }
            }
        } catch (error) {
            alert("Nastala chyba pri odosielaní súboru");
            navigate("/home");
        }
        
    };

    const stringToEncryptedFile = async (fileString, publicKeyRaw)  => {
        var publicKey = await importRSAKeyPublic(publicKeyRaw);
        var aesKeyIV = await generateAESKeyIV();
        var cipherText = await aesEncrypt(fileString, aesKeyIV.key, aesKeyIV.iv);
        var exportedKey = await exportAESKeyString(aesKeyIV.key);
        console.log(exportedKey);
        console.log(publicKey);
        let encryptedKey = await rsaEncrypt(exportedKey, publicKey);
        console.log(aesKeyIV);
        var fileToUpload = new File([aesKeyIV.iv,encryptedKey,cipherText], "foo.txt", {
            type: "text/plain",
            });
        return fileToUpload;
    }; 
    
    const getPublicKey = async (address) => {
        let addr = utils.getAddress(address);
        let result = await context.accManagerContract
                                .getPublicKey(addr);
        return JSON.parse(result);
    };

    const changeFolderEditOption = async () =>{
        if(isFolderEditable === true){
            await context.recordsContract.denyFolderEdit();
        }else{
            await context.recordsContract.allowFolderEdit();
        }
        navigate("/home");
    };

    const changeEdit = () =>{
        if(isFolderEditable === true){
            setDisabled(disabled ? false:true);
        }else{
            alert("Užívateľ zakázal editovanie.")
        }
    };

    const addRecord = () => {
        if(isFolderEditable === true){
            if(isCreatingRecord){
                if(newRecordData.data !== "" && newRecordData.title !== ""){
                    file.records.unshift(newRecordData);
                    setDisabled(true);
                }
            }else{
                setNewRecordData(new RecordData("DOCTORID","",""));
            }
            setIsCreatingRecord(isCreatingRecord ? false:true);
        }else{
            alert("Užívateľ zakázal editovanie.")
        }
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

    return (
        <Container>
    <Container id="viewForm" className="justify-content-center md-0 mt-3">
        <Form onSubmit={handleSubmit} >
            <Row></Row>
            <Row className="mt-3">
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
            <Row>
                <Form.Group className="xs-3">
                            <Form.Label>Adresa vlastníka hlavného súboru</Form.Label>
                            <Form.Control disabled={disabled} value={mainFileOwner} onChange={(e) => setMainFileOwner(e.target.value)} name="mainFileOwner" type="text"/>
                </Form.Group>  
            </Row>
            { role==="DOCTOR_ROLE"?  
                <Row>
                    <Row className="mt-2">
                        <Col>
                            <Button
                                onClick={changeEdit}
                            >
                                {disabled? "Povoliť editovanie":"Uložiť zmeny"}
                            </Button>
                        </Col>
                    </Row>
                </Row>
                
            :
            <Row >
                <Col md="4" className="m-auto">
                    <Button
                        onClick={changeFolderEditOption}
                    >
                        {isFolderEditable? "Zakázať editovanie zložky":"Povoliť editovanie zložky"}
                    </Button>
                </Col>
            </Row>             
            }
            </Form>
            <Row className="mt-4"></Row>
            </Container >

            <Container  id="viewForm" className="mt-2" >
            <Form>
                <Row></Row>
                <Row className="mt-3" >
                    {!isCreatingRecord? 
                        <Carousel interval={null} wrap={false}>
                        {file.records.map(item =>{
                            return(
                                <Carousel.Item key={Math.random()} >
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
                    :<Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
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
                    </Row>}
                </Row>
                {role==="DOCTOR_ROLE"?
                <Row>
                <Row className="justify-content-center m-auto mt-1">
                <Col xs>
                        <Button
                            onClick={addRecord}
                        >
                            {!isCreatingRecord? "Pridať záznam":"Uložiť nový záznam"}
                        </Button>
                    </Col>
                <Col lg></Col>
                    
                
                    
                    <Col lg></Col>
                    <Col xs>
                        <Button
                        onClick={handleSubmit}
                        >
                            Odoslať zmeny
                        </Button>
                    </Col>
                </Row>
                <Row className="mt-2"></Row>
                </Row>
            :<></>}
            </Form>
    </Container>
    </Container>
    );
}

export default ViewRecords;