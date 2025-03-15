import React from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

const FooterBar = () => {
  return (
    <Navbar bg="dark" variant="dark" fixed="bottom">
      <Container className="justify-content-center">
        <Navbar.Text>
          Contact us: 
          <a href="tel:+91 7011974522"> +91 7011974522</a>, 
          <a href="tel:+91 9990708731"> +91 9990708731</a> |
          Webapp creator: 
          <a href="https://www.example.com" target="_blank" rel="noopener noreferrer"> www.example.com</a>
        </Navbar.Text>
      </Container>
    </Navbar>
  );
};

export default FooterBar;