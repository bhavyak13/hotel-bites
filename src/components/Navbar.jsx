import React from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import { useFirebase } from "../context/Firebase";
import "./Navbar.css";

const MyNavbar = () => {
  const firebase = useFirebase();
  const { isAdmin, isDeliveryPartner } = firebase;

  return (
    <Navbar expand="lg" className="navbar">
      <Container>
        <Navbar.Brand as={Link} to={`/`}>Kalra Catters</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
          {isAdmin && (
              <Nav.Link as={Link} to={`/address`}>Add New Address</Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to={`/products/new`}>Add New Product</Nav.Link>
            )}
            {isDeliveryPartner && (
              <Nav.Link as={Link} to={`/orders/delivery-partner`}>Orders!</Nav.Link>
            )}
            {!isAdmin && !isDeliveryPartner && (
              <Nav.Link as={Link} to={`/contact`}>Contact us</Nav.Link>
            )}
            {!isAdmin && !isDeliveryPartner && (
              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  Policies
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={`/shipping-policy`}>Shipping Policy</Dropdown.Item>
                  <Dropdown.Item as={Link} to={`/privacy-policy`}>Privacy Policy</Dropdown.Item>
                  <Dropdown.Item as={Link} to={`/terms-condition`}>Terms & Conditions</Dropdown.Item>
                  <Dropdown.Item as={Link} to={`/cancel-refund`}>Cancellation & Refund</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
            {firebase?.user && !isAdmin && !isDeliveryPartner && (
              <Nav.Link as={Link} to={`/orders`}>My orders</Nav.Link>
            )}
            {firebase?.isAdmin && (
              <Nav.Link as={Link} to={`/orders/all`}>All orders</Nav.Link>
            )}
            {firebase?.user && (
              <button
                onClick={async () => {
                  await firebase.logoutUser();
                }}
                className="btn btn-light text-decoration-none text-dark"
              >
                Logout
              </button>
            )}
          </Nav>
        </Navbar.Collapse>
        {/* Links outside the toggle */}
        <Nav className="ms-auto">
          {!isAdmin && !isDeliveryPartner && (
            <Nav.Link as={Link} to={`/cart`}>Cart</Nav.Link>
          )}
          {!firebase?.user && (
            <Nav.Link as={Link} to={`/register`}>Register</Nav.Link>
          )}
          {!firebase?.user && (
            <Nav.Link as={Link} to={`/login`}>Login</Nav.Link>
          )}
          {/* {!firebase?.user && (
            <Nav.Link as={Link} to={`/otp-login`}>OTP Login</Nav.Link>
          )} */}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
