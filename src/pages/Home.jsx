import React, { useEffect, useState, useContext } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom"; // Import useNavigate
// import { SiteStatusContext } from "../context/siteStatusContext";
import FoodCard from "../components/FoodCard";
import "../pages/home.css";
import { Spinner } from "react-bootstrap";
import { Button } from "react-bootstrap";
import FooterBar from "../components/FooterBar";
import AdSlot from "../components/AdSlot"; // Import the AdSlot component

const HomePage = () => {
  const firebase = useFirebase();
  const { isAdmin, isSiteOpen, toggleSiteStatus, user } = firebase; // Added user for potential future use
  // const { isSiteOpen, toggleSiteStatus } = useContext(SiteStatusContext);
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await firebase.fetchProductsWithFirstVariant();
        setData(productsData || []); // Ensure data is an array
        setFilteredData(productsData || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [firebase]);

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
            {isSiteOpen ? "Close Site (Ordering Enabled)" : "Open Site (Ordering Disabled)"}
          </Button>
          {/* Removed Admin Refresh Page button */}
        </div>
      )}

      {/* Advertisement Space */}
      <div className="ad-container">
        {/* Replace with your actual AdSense Publisher ID and Ad Slot ID */}
        <AdSlot
          adClient="ca-pub-YOUR_ADSENSE_PUBLISHER_ID"
          adSlot="YOUR_AD_SLOT_ID_FOR_HOME_PAGE"
        />
      </div>

      {/* Header */}
      <div className="header">
        <div className="menu-title">Menu</div>
        <div className="cart-icon-container">
          <div className="cart-icon" onClick={() => navigate("/cart")}>🛒</div>
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
        <div className="menu-list">
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