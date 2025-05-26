import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useFirebase } from "../context/Firebase";
import "./CartFoodCard.css"; // Import the CSS file for additional styling

const CartFoodCard = (props) => {
  const {
    id,
    handleRemoveDocument,
    quantity: quantityFromProps,
    product,
    variant,
  } = props;

  const { name, description, status, productImage } = product || {};
  const firebase = useFirebase();
  const [url, setURL] = useState(null);
  const [quantity, setQuantity] = useState(Number(quantityFromProps) || 1);
  const itemPrice = Number(variant?.priceOffer) || Number(variant?.priceOriginal) || 0;
  const totalPriceForItem = quantity * itemPrice;

  // Update local quantity if parent prop changes (e.g., after cart refresh)
  useEffect(() => {
    setQuantity(Number(quantityFromProps) || 1);
  }, [quantityFromProps]);

  useEffect(() => {
    if (productImage) {
      firebase.getImageURL(productImage).then((url) => setURL(url));
    }
  }, [productImage, firebase]);

  const handleQuantityChange = async (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
    try {
      await firebase.updateCartItemQuantity(id, newQuantity);
      if (props.onCartUpdate) props.onCartUpdate(); // <-- call parent refresh
    } catch (error) {
      firebase.displayToastMessage("Failed to update quantity", "error");
    }
  };

  return (
    <Card className="cart-food-card">
      {url && <Card.Img className="cart-food-card-img" variant="top" src={url} alt={name || "Product image"} />}
      <Card.Body className="cart-food-card-body">
        <Card.Title className="cart-food-card-title">{name || "N/A"}</Card.Title>
        {description && <Card.Text className="cart-food-card-desc">{description}</Card.Text>}
        {status && <Card.Text className="cart-food-card-status">Status: <strong>{status}</strong></Card.Text>}
        <div className="cart-food-card-quantity-row">
          <button
            className="cart-food-card-quantity-btn"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
          >-</button>
          <span className="cart-food-card-quantity-value">{quantity}</span>
          <button
            className="cart-food-card-quantity-btn"
            onClick={() => handleQuantityChange(1)}
          >+</button>
        </div>
        <Card.Text className="cart-food-card-price">Price: <strong>INR {itemPrice.toFixed(2)}</strong></Card.Text>
        <Card.Text className="cart-food-card-total">Total Price: <strong>INR {totalPriceForItem.toFixed(2)}</strong></Card.Text>
        <button
          className="cart-food-card-remove-btn"
          onClick={async () => {
            if (handleRemoveDocument) {
              await handleRemoveDocument(id);
              firebase.displayToastMessage('Removed successfully!');
            }
          }}
        >
          Remove
        </button>
      </Card.Body>
    </Card>
  );
};

export default CartFoodCard;
