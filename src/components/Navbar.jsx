import React from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useFirebase } from "../context/Firebase";

const BASE_URL = "/hotel-bites";

const MyNavbar = () => {
  const firebase = useFirebase();

  const { isAdmin } = firebase;

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to={`/`}>Hotel-Bites</Navbar.Brand>
        <Nav className="me-auto">
          {/* <Nav.Link as={Link} to={`/`}>Home</Nav.Link> */}
          {/* <Nav.Link as={Link} to={`/products`}>Products</Nav.Link> */}
          {isAdmin &&
            <Nav.Link as={Link} to={`/products/new`}>Add New Product</Nav.Link>
          }
          <Nav.Link as={Link} to={`/cart`}>Cart</Nav.Link>

          {!firebase?.user &&
            <Nav.Link as={Link} to={`/register`}>Register</Nav.Link>
          }
          {!firebase?.user
            && <Nav.Link as={Link} to={`/login`}>Login</Nav.Link>
          }
          {firebase?.user
            && <Nav.Link as={Link} to={`/orders`}>My orders</Nav.Link>
          }
          {firebase?.isAdmin
            && <Nav.Link as={Link} to={`/orders/all`}>All orders</Nav.Link>
          }
          {firebase?.user &&
            <button
              onClick={async () => {
                await firebase.logoutUser()
              }}
            >
              logout
            </button>
          }
        </Nav>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
