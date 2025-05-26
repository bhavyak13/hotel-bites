import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import "./FoodCard.css"; // Import the CSS file for additional styling

import { useFirebase } from "../context/Firebase";

const FoodCard = (data) => {
  const { id, name, description, status, firstVariant, productImage } = data;

  const firebase = useFirebase();
  const navigate = useNavigate();
  const [url, setURL] = useState(null);

  useEffect(() => {
    if (productImage) {
      firebase.getImageURL(productImage).then((url) => setURL(url));
    }
  }, [productImage]);

  const redirectToOtherPages = (pageName, variantId = null) => {
    const productId = id;
    let link = "";

    if (pageName === "detail") {
      link = `/products/${productId}`;
    } else if (pageName === "variant") {
      link = `/products/${productId}/variants/new`; // Add New Variant
    } else if (pageName === "edit") {
      link = `/products/${productId}/variants/edit`; // Edit Variant
    }
    else if (pageName === "edit product") {
      link = `/products/${productId}/edit`; // Edit Variant
    }

    navigate(link);
  };

  // Determine card styles and button behavior based on status
  const isActive = status === "active";
  const cardStyle = !firebase.isAdmin
    ? {
        width: "18rem",
        margin: "25px",
        backgroundColor: isActive ? "white" : "#f8f9fa", // Grey background for inactive
        opacity: isActive ? 1 : 0.6, // Reduce opacity for inactive
        pointerEvents: isActive ? "auto" : "none", // Disable interactions for inactive
      }
    : {
        width: "18rem",
        margin: "25px",
      }; // No special styles for admin

  return (
    <Card className="food-card" style={cardStyle}>
      {url && <Card.Img className="food-card-img" variant="top" src={url} alt={name} />}
      <Card.Body className="food-card-body">
        <Card.Title className="food-card-title">{name}</Card.Title>
        <Card.Text>{description}</Card.Text>
        {firebase.isAdmin && (
          <Card.Text>Status: <strong>{status}</strong></Card.Text>
        )}
        <Card.Text>
          Price: <strong>₹ {firstVariant?.priceOffer || firstVariant?.priceOriginal}</strong>
        </Card.Text>
        {!firebase.isAdmin && !firebase.isDeliveryPartner && isActive && (
          <Button onClick={() => redirectToOtherPages("detail")} variant="primary">
            Details
          </Button>
        )}
        {firebase.isAdmin && (
          <Button onClick={() => redirectToOtherPages("variant")} variant="primary">
            Add New Variant
          </Button>
        )}
        {firebase.isAdmin && (
          <Button
            onClick={() => redirectToOtherPages("edit", firstVariant?.id)} // Pass the variant ID
            variant="primary"
          >
            Edit Variant
          </Button>
        )}
        {firebase.isAdmin && (
          <Button
            onClick={() => redirectToOtherPages("edit product", firstVariant?.id)} // Pass the variant ID
            variant="primary"
          >
            Edit Product
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default FoodCard;
