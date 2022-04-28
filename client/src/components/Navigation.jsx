import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from "react-router-dom";


function Navigation(){
    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand>  <img style={{width: 50, height: 50}} src="logo192.png" alt="Logo"/></Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/home">Home</Nav.Link>
                    <Nav.Link as={Link} to="/createNewRecord">Create Record</Nav.Link>
                    <Nav.Link as={Link} to="/addRecordData">Add Record Data</Nav.Link>
                    <Nav.Link as={Link} to="/getRecord">Get Record</Nav.Link>
                    <Nav.Link as={Link} to="/viewRecords">View Recods</Nav.Link>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
}

export default Navigation;