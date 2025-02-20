import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

const MyNavbar = () => {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home">Navbar</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/products">Products</Nav.Link>
          <Nav.Link href="/products/new">Add New Product</Nav.Link>
          {/* <Nav.Link href="/variants/new">Add New Variant</Nav.Link> */}
          {/* <Nav.Link href="/products/:productId">Add New Product</Nav.Link> */}
          {/* <Nav.Link href="/products/:productId/variants/new">Add New Variant</Nav.Link> */}
          <Nav.Link href="/cart">Cart</Nav.Link>
          <Nav.Link href="/login">login</Nav.Link>
          <Nav.Link href="/register">Register</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
