import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";

import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import { Alert, Button } from "react-bootstrap";
import CartFoodCard from "../components/CartFoodCard";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!firebase?.user) { // if not login 
      navigate("/login");
    }
  }, [firebase, navigate]);


  return (
    <div className="container mt-5">
      
    </div>
  );
};

export default PaymentPage;
