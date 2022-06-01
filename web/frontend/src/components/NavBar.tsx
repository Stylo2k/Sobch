
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { isLoggedIn } from '../lib/acc';
import Nav from 'react-bootstrap/Nav';
import goLogout from '../lib/acc';


function NavBar() {
    return(
        <Navbar bg="light" expand="lg">
        <Container>
            <Navbar.Brand href="/"> <img
          alt=""
          src="/Sobchlogo.png"
          width="200"
          height="110"
          className="d-inline-block align-top"/></Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
                <Nav.Link href="/">Home</Nav.Link>
            </Nav>
            <Nav>
                {
                    isLoggedIn() ?

                    <>
                    <Nav.Link href="/my-devices">My Devices</Nav.Link>
                    <Nav.Link href="/profile">Profile</Nav.Link>
                    <Nav.Link href="/logout">Logout</Nav.Link></>
                    :
                    <>
                    <Nav.Link href="/register">Register</Nav.Link>
                    <Nav.Link href="/login">Login</Nav.Link>
                    </>
                }

<<<<<<< HEAD
                <Nav.Link href ="/"onSelect={goLogout}>Logout</Nav.Link>
=======
>>>>>>> ad124e9bfc6cefd8b510c083049e4b66067d758b
            </Nav>
            </Navbar.Collapse>
        </Container>
        </Navbar>
    );
}

export default NavBar;