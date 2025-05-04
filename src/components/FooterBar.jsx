import React from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import "./FooterBar.css"; // Import the CSS file for additional styling

const FooterBar = () => {
  return (
    <Navbar className="footer-bar">
      <Container className="justify-content-center">
        <Navbar.Text>
          Contact us: 
          <a href="tel:+91 7011974522"> +91 7011974522</a>, 
          <a href="tel:+91 9311764250"> +91 9311764250</a> |
          Webapp creator: 
          <a href="https://srijan1.github.io/Srijan-AI-LP/" target="_blank" rel="noopener noreferrer">Srijan.ai</a>
        </Navbar.Text>
      </Container>
    </Navbar>
  );
};

export default FooterBar;