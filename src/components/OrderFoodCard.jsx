import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import { useFirebase } from "../context/Firebase";

const OrderFoodCard = (data) => {
  const { id, handleRemoveDocument, quantity = 0 } = data;
  const { 
    name = "Unknown Item", 
    description = "No description available", 
    status = "N/A", 
    productImage 
  } = data?.product || {}; // Use default values if product is undefined
  const { variant, finalPrice } = data || {}; // Use default values if data is undefined

  const firebase = useFirebase();
  const navigate = useNavigate();
  const [url, setURL] = useState(null);

  useEffect(() => {
    if (productImage) {
      // Uncomment the following line if you want to fetch the image URL
      // firebase.getImageURL(productImage).then((url) => setURL(url));
    }
  }, [productImage]); // Added dependency

  return (
    <Card style={{ width: "18rem", margin: "25px" }}>
      {/* Render the image only if the URL is available */}
      {url && <Card.Img variant="top" src={url} alt={name} />}
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>Quantity: {quantity}</Card.Text>
        <Card.Text>
          Price: <strong>₹ {variant?.priceOffer || variant?.priceOriginal || 0}</strong>
        </Card.Text>
        <Card.Text>
          Total Price: <strong>₹ {quantity * (variant?.priceOffer || variant?.priceOriginal || 0)}</strong>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default OrderFoodCard;
