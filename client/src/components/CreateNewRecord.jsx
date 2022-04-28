import React, { useState,useEffect  } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Row, Col} from "react-bootstrap";
import SmartContractsContext from "../shared/SmartContractsContext";
import { useNavigate } from "react-router-dom";
import { recordTemplate } from "../shared/fileTemplate";

function CreateNewRecord() {
    const context = React.useContext(SmartContractsContext);
    const navigate = useNavigate();

    const handleSubmit = async(event) =>{
        event.preventDefault();
        let res = recordTemplate;
        let form = event.target;
        res.name = form.name.value;
        res.lastName = form.lastName.value;
        res.birthDate = form.birthDate.value;
        res.bloodType = form.bloodType.value;
        context.setRecordFile(res);
        navigate("/addRecordData");
    };

    return(
        <Form onSubmit={handleSubmit} className="justify-content-center w-50 m-auto mt-2">

            <Row className="mt-2">
                <Col>
                    <Form.Group className="xs-3">
                        <Form.Label>Meno</Form.Label>
                        <Form.Control name="name" type="text" placeholder="meno" />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="xs-3">
                        <Form.Label>Priezvisko</Form.Label>
                        <Form.Control name="lastName" type="text" placeholder="priezvisko" />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mt-2">
                <Col>
                    <Form.Group className="xs-3">
                        <Form.Label>Dátum narodenia</Form.Label>
                        <Form.Control name="birthDate" type="date"/>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="xs-3">
                        <Form.Label>Krvná skupina</Form.Label>
                        <Form.Control name="bloodType" type="text" placeholder="A,B.." />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="justify-content-center mt-2">
                <Form.Group className="m-auto" >
                    <Button
                    variant="primary"
                    type="submit"
                    >
                    Pokračovať
                    </Button>
                </Form.Group>
            </Row>
            
    </Form>
    );
}

export default CreateNewRecord;
