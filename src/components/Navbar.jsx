import React from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

const BASE_URL = "/hotel-bites";

const MyNavbar = () => {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to={`/`}>Hotel-Bites</Navbar.Brand>
        <Nav className="me-auto">
          {/* <Nav.Link as={Link} to={`/`}>Home</Nav.Link> */}
          {/* <Nav.Link as={Link} to={`/products`}>Products</Nav.Link> */}
          <Nav.Link as={Link} to={`/products/new`}>Add New Product</Nav.Link>
          <Nav.Link as={Link} to={`/cart`}>Cart</Nav.Link>
          <Nav.Link as={Link} to={`/login`}>Login</Nav.Link>
          <Nav.Link as={Link} to={`/register`}>Register</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
