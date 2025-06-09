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
    // Ensure firebase is available before trying to use it
    if (!firebase) return;
    if (productImage) {
      firebase.getImageURL(productImage).then((url) => setURL(url));
    }
  }, [productImage, firebase]);

  // Use firebase context directly for isSiteOpen and isAdmin
  // These will be reactive due to onSnapshot (for isSiteOpen) and onAuthStateChanged (for isAdmin)
  const canOrder = firebase.isSiteOpen || firebase.isAdmin;

  const handleAddToCart = async () => {
    if (firstVariant && id && firebase.user) {
      try {
        await firebase.addToCart(id, firstVariant.id, 1); // Add 1 quantity
      } catch (err) {
        // Error is already handled and toasted within firebase.addToCart
        console.error("Error in FoodCard handleAddToCart:", err.message);
      }
    } else if (!firebase.user) {
      firebase.displayToastMessage("Please log in to add items to your cart.", "error");
    } else {
      firebase.displayToastMessage("Item details are missing, cannot add to cart.", "error");
    }
  };
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
  const cardStyle = !firebase.isAdmin // Styles for non-admin users
    ? {
        width: "18rem",
        margin: "25px",
        backgroundColor: isActive ? "white" : "#f8f9fa", // Grey background for inactive
        opacity: isActive && canOrder ? 1 : 0.6, // Reduce opacity if inactive or cannot order
        pointerEvents: isActive && canOrder ? "auto" : "none", // Disable interactions if inactive or cannot order
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
          <Button
            disabled={!canOrder} // Disable if site is closed and user is not admin
            onClick={async () => {
              if (!canOrder) {
                firebase.displayToastMessage("Ordering is currently disabled as the site is closed.", "warning");
                return;
              }
              redirectToOtherPages("detail");
            }}
            variant="primary"
          >
            Details
          </Button>
        )}
        {/* Message for non-admins if ordering is disabled */}
        {!firebase.isAdmin && !firebase.isDeliveryPartner && isActive && !canOrder && (
          <div className="text-danger mt-2" style={{ fontWeight: "bold" }}>Ordering is temporarily disabled.</div>
        )}
        {firebase.isAdmin && ( // Admin buttons
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
