import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import "../pages/home.css";

const HomePage = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      await firebase.fetchProductsWithFirstVariant().then((products) => {
        const activeProducts = products.filter(
          (product) => product.status === "active"
        ); // Filter active products here
        setData(activeProducts);
        setFilteredData(activeProducts); // Initialize filtered data with active products
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
        item.status === "active"
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
            filteredData.map((item) => (
              <FoodCard key={item.id} {...item} />
            ))
          ) : (
            <p className="text-center mt-4">No items match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
