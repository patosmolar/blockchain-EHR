import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from "react-router-dom";


function Navigation(){
    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand>OBRAZOK</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/home">Home</Nav.Link>
                    <Nav.Link as={Link} to="/uploadRecord">Upload Record</Nav.Link>
                    <Nav.Link as={Link} to="/getRecord">Get Record</Nav.Link>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
}

export default Navigation;