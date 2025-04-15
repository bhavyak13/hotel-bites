import React, { useEffect, useState, useContext } from "react";
import { useFirebase } from "../context/Firebase";
import { SiteStatusContext } from "../context/siteStatusContext";
import FoodCard from "../components/FoodCard";
import "../pages/home.css";
import { Spinner } from "react-bootstrap";
import { Button } from "react-bootstrap";
import FooterBar from "../components/FooterBar";

const HomePage = () => {
  const firebase = useFirebase();
  const { isAdmin } = firebase;
  const { isSiteOpen, toggleSiteStatus } = useContext(SiteStatusContext);

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
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
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

  // If the site is closed and the user is not an admin, show the "Site Closed" message
  if (!isSiteOpen && !isAdmin) {
    return (
      <div className="text-center mt-5">
        <h1>Site Closed</h1>
        <p>We are currently on vacation. Please check back later!</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Admin Toggle Button */}
      {isAdmin && (
        <div className="text-center mb-4">
          <Button variant={isSiteOpen ? "danger" : "success"} onClick={toggleSiteStatus}>
            {isSiteOpen ? "Close Site" : "Open Site"}
          </Button>
        </div>
      )}

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
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Food Menu */}
      <div className="menu-container">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id} className="menu-item">
              <FoodCard {...item} />
            </div>
          ))
        ) : (
          <p className="text-center mt-4">No items match your search.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;