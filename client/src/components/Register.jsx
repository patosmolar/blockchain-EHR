import React, { useState,useEffect, useRef  } from "react";
import { Button, Form, Container, Col, Row } from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import EthersUtils from "ethers-utils";



function Register() {
    const context = React.useContext(SmartContractsContext);
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


    return (
    <Container>
        <Row>   
            <Col className="xs">   
                <Form onSubmit={onRegisterDoctor}>
                    <Form.Group  className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Adresa doktora</Form.Label>
                        <Form.Control ref={doctorsAddressField} type="text" placeholder="Enter doctors address"/>
                        <Form.Text className="text-muted">
                        Zaregistrovat doktora.
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Col>

            <Col className="xs">   
                <Form onSubmit={onRegisterPatient}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Pacientova adresa</Form.Label>
                        <Form.Control ref={patientsAddressField} type="text" placeholder="Enter patients address" />
                        <Form.Text className="text-muted">
                        Zaregistrovat pacienta.
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Col>
        </Row>
        
    </Container>
    );
}

export default Register;