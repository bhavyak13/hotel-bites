import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup"; //We may no longer use this in our new layout, so it can be deleted later if you want.
import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import "../pages/home.css";

const HomePage = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]);

  useEffect(() => {
    firebase.fetchProductsWithFirstVariant().then((data) => setData(data));
  }, []);


  return (
    <div className="home-page">
      {/* Advertisement Space */}
      <div className="ad-container">Advertising space</div>

      {/* Header */}
      <div className="header">
        <div className="menu-title">Menu</div>
        <div className="cart-icon-container">
          <div className="cart-icon">🛒</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for food..."
        />
      </div>

      {/* Food Menu */}
      <div className="menu-container">
        <div className="menu-list">
          {data?.map((item) => (
            <FoodCard
              key={item.id}
              {...item}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
