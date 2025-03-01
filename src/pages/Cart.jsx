import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";

import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import { Alert, Button } from "react-bootstrap";
import CartFoodCard from "../components/CartFoodCard";
import { useNavigate } from "react-router-dom";
import "../pages/home.css";

const Cart = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]);
  const [finalPrice, setFinalPrice] = useState(0);

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

  const calculateFinalPrice = () => {
    const total = data.reduce((sum, item) => {
      const price = item?.variant?.priceOffer || item?.variant?.priceOriginal || 0;
      return sum + (item.quantity * price);
    }, 0);
    setFinalPrice(total);
  };

  useEffect(() => {
    if(data){
      calculateFinalPrice();
    }else{
      setFinalPrice("Not found");
    }
  }, [data]);


  // console.log("BK data", data);
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate('/payment');
  }

  return (
    <div className="home-page">
      {/* Advertisement Space */}
      <div className="ad-container">Advertising space</div>
      
            {/* Header */}
            <div className="header">
        <div className="order-summary">Order Summary</div>
        </div>

      {data?.length === 0
        ? <Alert key={"info"} variant={"info"}>
          Cart Empty!
        </Alert>
        : (
          <>
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
            <div className="final-price">
              final price : {finalPrice}
            </div>
            <Button onClick={() => handleBuyNow()} variant="primary">
              Buy Now
            </Button>
          </>
        )

      }
    </div>
  );
};

export default Cart;