import React from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useFirebase } from "../context/Firebase";

const BASE_URL = "/hotel-bites";

const MyNavbar = () => {
  const firebase = useFirebase();

  const { isAdmin, isDeliveryPartner } = firebase;

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to={`/`}>Menu</Navbar.Brand>
        <Nav className="ms-auto"> {/* Added ms-auto to shift items to the right */}
          {isAdmin &&
            <Nav.Link as={Link} to={`/products/new`}>Add New Product</Nav.Link>
          }

          {isDeliveryPartner &&
            <Nav.Link as={Link} to={`/orders/delivery-partner`}>Orders!</Nav.Link>
          }

          {!isAdmin && !isDeliveryPartner &&
            <Nav.Link as={Link} to={`/cart`}>Cart</Nav.Link>
          }

          {!firebase?.user &&
            <Nav.Link as={Link} to={`/register`}>Register</Nav.Link>
          }
          {!firebase?.user &&
            <Nav.Link as={Link} to={`/login`}>Login</Nav.Link>
          }
          {firebase?.user && !isAdmin && !isDeliveryPartner &&
            <Nav.Link as={Link} to={`/orders`}>My orders</Nav.Link>
          }
          {firebase?.isAdmin &&
            <Nav.Link as={Link} to={`/orders/all`}>All orders</Nav.Link>
          }
          {firebase?.user &&
            <button
              onClick={async () => {
                await firebase.logoutUser();
              }}
              className="btn btn-light text-decoration-none text-dark"
            >
              Logout
            </button>
          }
        </Nav>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
