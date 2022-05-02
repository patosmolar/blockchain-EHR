import React, { useState,useEffect, useRef  } from "react";
import { Button, Form, Container, Col, Row, Card } from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import EthersUtils from "ethers-utils";



function Register() {
    const context = React.useContext(SmartContractsContext);
    var role = context.logedUserType;
    let patientsAddressField = useRef(null);
    let doctorsAddressField = useRef(null);

    const onRegisterDoctor =  async (event) => {
        event.preventDefault();
        console.log(EthersUtils.getAddress(doctorsAddressField.current.value));
        let result = await context.accManagerContract
                                .registerDoctor(EthersUtils.getAddress(doctorsAddressField.current.value));
        console.log(result);
    };


    const onRegisterPatient = async (event) => {
        event.preventDefault();
        console.log(patientsAddressField.current.value);
        let result = await context.accManagerContract
                                .registerNewPatient(EthersUtils.getAddress(patientsAddressField.current.value));
        console.log(result);
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
                                <Form.Group  className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Adresa doktora</Form.Label>
                                    <Form.Control ref={doctorsAddressField} type="text" placeholder="0x16a..."/>
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