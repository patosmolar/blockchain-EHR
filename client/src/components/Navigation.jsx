import React,{useState} from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link } from "react-router-dom";
import SmartContractsContext from "../shared/SmartContractsContext";

function Navigation(){
    const context = React.useContext(SmartContractsContext);
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(1);
    const register = context.logedUserType === "DOCTOR_ROLE" || context.logedUserType === "ADMIN_ROLE";
    
    const handleOpen = () =>{
        setOpen(open? false:true);
    }
    const handleIndex = (index) =>{
        setIndex(index);
    };

    return (
        <Navbar>
            <Container>
                <Navbar.Brand> <img style={{width: 50, height: 50}} src="logo192.png" alt="Logo" placement="end"/></Navbar.Brand>
                <Nav onSelect={handleIndex} activeKey={index} className="me-auto text-color-black">
                    <Nav.Link eventKey={1} as={Link} to="/home">Home</Nav.Link>
                    {register &&
                    <Nav.Link eventKey={2} as={Link} to="/register">Register</Nav.Link>
                    }  
                </Nav>
                {open?
                    <Button variant="info" onClick={handleOpen}>
                        {context.account}
                    </Button>
                    :
                    <Button variant="info" onClick={handleOpen}>
                        Zobraziť adresu
                    </Button>
                }
               
            </Container>
        </Navbar>
    );
}

export default Navigation;