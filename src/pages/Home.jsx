import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";
import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import "../pages/home.css";
import { Spinner } from "react-bootstrap";
import { Button } from "react-bootstrap";
import FooterBar from "../components/FooterBar";

const HomePage = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      await firebase.fetchProductsWithFirstVariant().then((data) => {
        setData(data);
        setFilteredData(data);
      });
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = data.filter(
      (item) =>
        (item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)) &&
        item.status === "active" // Ensure only active items are shown
    );
    setFilteredData(filtered);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Welcome! We are loading products for you..</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="ad-container">Advertising space</div>
      <div className="header">
        <div className="menu-title">Menu</div>
        <div className="cart-icon-container">
          <div className="cart-icon">🛒</div>
        </div>
      </div>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for food..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="menu-container">
        <div className="menu-list">
          {filteredData.length > 0 ? (
            filteredData
              .filter((item) => item.status === "active") // Filtering inactive items
              .map((item) => <FoodCard key={item.id} {...item} />)
          ) : (
            <p className="text-center mt-4">No items match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
