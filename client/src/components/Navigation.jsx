import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from "react-router-dom";
import SmartContractsContext from "../shared/SmartContractsContext";

function Navigation(){
    const context = React.useContext(SmartContractsContext);
    const register = context.logedUserType === "DOCTOR_ROLE" || context.logedUserType === "ADMIN_ROLE";
    return (
        <Navbar>
            <Container>
                <Navbar.Brand> <img style={{width: 50, height: 50}} src="logo192.png" alt="Logo" placement="end"/></Navbar.Brand>
                
                <Nav className="me-auto text-color-black">
                    <Nav.Link  as={Link} to="/home">Home</Nav.Link>
                    {register &&
                    <Nav.Link as={Link} to="/register">Register</Nav.Link>
                    }  
                </Nav>
              <strong>{context.account} </strong>  
            </Container>
        </Navbar>
    );
}

export default Navigation;