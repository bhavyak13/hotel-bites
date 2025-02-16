import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import { useFirebase } from "../context/Firebase";

const FoodCard = (data) => {

  const { id, name, description, status, link } = data;

  const firebase = useFirebase();
  const navigate = useNavigate();
  const [url, setURL] = useState(null);

  // useEffect(() => {
  //   if (imageURL) {
  //     firebase.getImageURL(imageURL).then((url) => setURL(url));
  //   }
  // }, [imageURL]); // Added dependency

  const addToCart = () => {

    const quantity = 1;

    const payload = {
      variantId,
      productId: id,
      quantity,
    }
    // firebase.handleCreateNewDoc(payload, "shoppingCartItems");
  }

  return (
    <Card style={{ width: "18rem", margin: "25px" }}>
      {url && <Card.Img variant="top" src={url} alt={name} />}
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>{description}</Card.Text>
        <Card.Text>Status: <strong>{status}</strong></Card.Text>
        <Button onClick={() => navigate(link)} variant="primary">
          View Details
        </Button>
        <Button onClick={() => addToCart()} variant="primary">
          Add to cart
        </Button>
      </Card.Body>
    </Card>
  );
};

export default FoodCard;
