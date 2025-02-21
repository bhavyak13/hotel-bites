import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";

import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import { Button } from "react-bootstrap";

const Cart = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]);

  useEffect(() => {
    firebase.getDocuments("shoppingCartItems")
      .then((data) =>
        setData(data.docs)
      );
  }, []);

  const handleBuyNow=()=>{
    firebase.createOrder();
  }

  return (
    <div className="container mt-5">
      <CardGroup>
        {data?.map((book) => (
          <FoodCard
            key={book.id}
            id={book.id}
            {...book.data()}
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
