import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import { useFirebase } from "../context/Firebase";

const OrderFoodCard = (data) => {

  const { id, handleRemoveDocument, quantity } = data;
  const { name, description, status, productImage } = data?.product;
  const { variant , finalPrice} = data;

  // console.log("BK data", data);

  const firebase = useFirebase();
  const navigate = useNavigate();
  const [url, setURL] = useState(null);

  useEffect(() => {
    if (productImage) {
      firebase.getImageURL(productImage).then((url) => setURL(url));
    }
  }, [productImage]); // Added dependency




  return (
    <Card style={{ width: "18rem", margin: "25px" }}>
      {url && <Card.Img variant="top" src={url} alt={name} />}
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>quantity: {quantity}</Card.Text>
        <Card.Text>Price: <strong>₹ {variant?.priceOffer || variant?.priceOriginal}</strong></Card.Text>
        <Card.Text>Total Price: <strong>₹ {quantity * (variant?.priceOffer || variant?.priceOriginal)}</strong></Card.Text>
      </Card.Body>
    </Card>
  );
};

export default OrderFoodCard;
