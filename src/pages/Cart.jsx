import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";

import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import { Button } from "react-bootstrap";
import CartFoodCard from "../components/CartFoodCard";

const Cart = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]);

  const fetchData = async () => {
    await firebase.fetchCartWithDetails("shoppingCartItems")
      .then((data) =>
        setData(data)
      );
  }

  const handleRemoveDocument = async (id) => {
    await firebase.removeDocumentWithId("shoppingCartItems", id);
    await fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  // console.log("BK data", data);

  const handleBuyNow = () => {
    firebase.createOrder();
  }

  return (
    <div className="container mt-5">
      <CardGroup>
        {data?.map((book) => (
          <CartFoodCard
            key={book.id}
            id={book.id}
            handleRemoveDocument={handleRemoveDocument}
            {...book}
          />
        ))}
      </CardGroup>
      <Button onClick={() => handleBuyNow()} variant="primary">
        Buy Now
      </Button>
    </div>
  );
};

export default Cart;
