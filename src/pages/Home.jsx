import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";
import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";

const HomePage = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    firebase.fetchProductsWithFirstVariant().then((data) => setData(data));
  }, []);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + parseFloat(item.price), 0).toFixed(2);
  };

  return (
    <div>
      {/* Advertisement Space */}
      <div className="ad-container">Advertising space</div>

      {/* Header */}
      <div className="header">
        <div className="menu-title">QuickEats</div>
        <div className="cart-icon">🛒</div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input type="text" className="search-input" placeholder="Search for food..." />
      </div>

      {/* Food Menu */}
      <div className="menu-container">
        <CardGroup className="menu-list">
          {data?.map((item) => (
            <FoodCard key={item.id} {...item} addToCart={() => addToCart(item)} />
          ))}
        </CardGroup>
      </div>

      


    </div>
  );
};

export default HomePage;
