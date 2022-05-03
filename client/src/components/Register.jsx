import React, { useRef  } from "react";
import { Button, Form, Container, Col, Row, Card } from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import EthersUtils from "ethers-utils";
import {generateKeyPairRSA,wrapRsaPrivate, arrayBufferToString} from "../shared/Utils";


function Register() {
    const context = React.useContext(SmartContractsContext);
    var role = context.logedUserType;
    let patientsAddressField = useRef(null);
    let patientsPassword = useRef(null);
    let doctorsPassword = useRef(null);
    let doctorsAddressField = useRef(null);

    const onRegisterDoctor =  async (event) => {
        event.preventDefault();
        var keyPair = await generateKeyPairRSA();
        var wrappedPrivate = await wrapRsaPrivate(keyPair.privateKey, doctorsPassword.current.value);
        var stringedPrivate = arrayBufferToString(wrappedPrivate);
        var stringedPublic = JSON.stringify(await window.crypto.subtle.exportKey("jwk", keyPair.publicKey));
        await context.accManagerContract
                                .registerDoctor(EthersUtils.getAddress(doctorsAddressField.current.value),
                                stringedPublic, stringedPrivate);
    };

    const onRegisterPatient = async (event) => {
        event.preventDefault();
        var keyPair = await generateKeyPairRSA();
        var wrappedPrivate = await wrapRsaPrivate(keyPair.privateKey, patientsPassword.current.value);
        var stringedPrivate = arrayBufferToString(wrappedPrivate);
        var stringedPublic = JSON.stringify(await window.crypto.subtle.exportKey("jwk", keyPair.publicKey));
        await context.accManagerContract
                                .registerNewPatient(EthersUtils.getAddress(patientsAddressField.current.value),
                                stringedPublic, stringedPrivate);
    };

    if(role === "ADMIN_ROLE"){
        return (
            <Container className="mt-5 w-75 justify-content-center text-center">
                <Row>   
                    <Col>
                        <Card>
                        <Card.Header>
                            Zaregistrovať nového pacienta
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={onRegisterPatient}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Pacientova adresa</Form.Label>
                                    <Form.Control ref={patientsAddressField} type="text" placeholder="0x16a..." />
                                    <Form.Text className="text-muted">
                                    
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>Heslo</Form.Label>
                                    <Form.Control ref={patientsPassword} type="password" />
                                    <Form.Text className="text-muted">
                                    
                                    </Form.Text>
                                </Form.Group>
                                
                                <Button variant="info" type="submit">
                                    Zaregistrovať
                                </Button>
                            </Form>
                        </Card.Body>
                        </Card>
                    </Col>
                
                    <Col className="xs">   
                    <Card>
                        <Card.Header>
                            Zaregistrovať nového doktora
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={onRegisterDoctor}>
                                <Form.Group  className="mb-3" controlId="formBasicEmail2">
                                    <Form.Label>Adresa doktora</Form.Label>
                                    <Form.Control ref={doctorsAddressField} type="text" placeholder="0x16a..."/>
                                    <Form.Text className="text-muted">
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="password2">
                                    <Form.Label>Heslo</Form.Label>
                                    <Form.Control ref={doctorsPassword} type="password" />
                                    <Form.Text className="text-muted">
                                    
                                    </Form.Text>
                                </Form.Group>

                                <Button variant="info" type="submit">
                                    ZAREGISTROVAŤ
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                        
                    </Col>
        
                    
                </Row>
                
            </Container>
            );
    }else if(role === "DOCTOR_ROLE"){
        return(
            <Container className="w-50 justify-content-center text-center">
                <Row className="mt-3">         
                    <Col className="xs">   
                    <Card>
                        <Card.Header>
                            Zaregistrovať nového pacienta
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={onRegisterPatient}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Pacientova adresa</Form.Label>
                                    <Form.Control ref={patientsAddressField} type="text" placeholder="0x16a..." />
                                    <Form.Text className="text-muted">
                                    
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>Heslo</Form.Label>
                                    <Form.Control ref={patientsPassword} type="password" />
                                    <Form.Text className="text-muted">
                                    
                                    </Form.Text>
                                </Form.Group>

                                <Button variant="primary" type="submit">
                                    Zaregistrovať
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    </Col>
                </Row>
                
            </Container>
        );
    }else{
        return(
            <Container>
            zly login
        </Container>
        );
    }

    
}

export default Register;