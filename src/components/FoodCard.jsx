import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import { useFirebase } from "../context/Firebase";

const FoodCard = (data) => {

  const { id, name, description, status, firstVariant, productImage } = data;

  // // console.log("BK data", data);

  const firebase = useFirebase();

  const navigate = useNavigate();
  const [url, setURL] = useState(null);

  useEffect(() => {
    if (productImage) {
      firebase.getImageURL(productImage).then((url) => setURL(url));
    }
  }, [productImage]); // Added dependency

  const redirectToOtherPages = (pageName) => {
    const productId = id;
    let link = '';

    if (pageName === 'detail') {
      link = `/products/${productId}`;
    } else {
      link = `/products/${productId}/variants/new`;
    }

    navigate(link)
  }


  return (
    <Card style={{ width: "18rem", margin: "25px" }}>
      {url && <Card.Img variant="top" src={url} alt={name} />}
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>{description}</Card.Text>
        <Card.Text>Status: <strong>{status}</strong></Card.Text>
        <Card.Text>Price: <strong>₹ {firstVariant?.priceOriginal || firstVariant?.priceOffer}</strong></Card.Text>
        <Button onClick={() => redirectToOtherPages("detail")} variant="primary">
          Details
        </Button>
        {firebase.isAdmin &&
          <Button onClick={() => redirectToOtherPages("variant")} variant="primary">
            Add New Variant
          </Button>
        }
      </Card.Body>
    </Card>
  );
};

export default FoodCard;
