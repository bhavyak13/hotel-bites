import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup"; //We may no longer use this in our new layout, so it can be deleted later if you want.
import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import "../pages/home.css";
import { Spinner } from "react-bootstrap";
import { Button } from "react-bootstrap";
import FooterBar from "../components/FooterBar"; 

const HomePage = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]); // Original data fetched from Firebase
  const [filteredData, setFilteredData] = useState([]); // Data filtered based on search input
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [siteIsOpen, setSiteIsOpen] = useState(true); // Assume site is open by default


  useEffect(() => {
    const fetchProducts = async () => {
      await firebase.fetchProductsWithFirstVariant().then((data) => {
        setData(data);
        setFilteredData(data); // Initialize filtered data with all products
      });
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
        const fetchSiteStatus = async () => {
          const isOpen = await firebase.getSiteStatus();
          setSiteIsOpen(isOpen);
          setLoadingStatus(false);
        };
        fetchSiteStatus();
      }, []);

  // Handle search input changes
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter the data based on the search query
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(query) || // Match by name
      item.description.toLowerCase().includes(query) // Match by description
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
      {/* Advertisement Space */}
      <div className="ad-container">Advertising space</div>

      {/* Header */}
      {/* <div className="header">
        <div className="menu-title">Menu</div>
        <div className="cart-icon-container">
          <div className="cart-icon">🛒</div>
        </div>
      </div> */}

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for food..."
          value={searchQuery}
          onChange={handleSearch} // Call handleSearch on input change
        />
      </div>

      {/* Food Menu */}
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
