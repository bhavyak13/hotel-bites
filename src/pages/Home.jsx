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
// import { filterProductsByQuery, loadProductsForMenu } from "../utils/productSearch";

// add to useState declarations

// Define the new content mapping
const circularPromises = [
  {
    icon: "♻️",
    title: "1. True Circularity",
    description: "Clothes don't have to die on your bedroom chair. Bought it from us and wore it out? Relist it back. We treat your closet as a rotating investment, not a graveyard.",
    className: "card-green"
  },
  {
    icon: "🛍️",
    title: "2. Unlocking the Streets",
    description: "We couldn't say \"stash\" without bringing out Miss Sarojini. We're taking the best premium vendors from Sarojini Nagar and making them accessible to you, no matter where you are in India.",
    className: "card-blue"
  },
  {
    icon: "✅",
    title: "3. Verified Curators",
    description: "Say goodbye to getting scammed by random IG pages. We strictly vet every curator on our platform. No surprises, just premium, verified drops. Zero trust issues.",
    className: "card-purple"
  },
  {
    icon: "💸",
    title: "4. Cash Your Stash",
    description: "Stop letting your ex's hoodie take up extra space in your closet. List it with us. Anyone can be a seller here. List the pieces sitting at the back of your closet, get real value out of them, and give your clothes a new home.",
    className: "card-yellow"
  },
  {
    icon: "🤝",
    title: "5. The Thrill of the Bargain",
    description: "It wouldn't be Indian thrifting without a little haggling. Skip the awkward DMs and use our \"Get a special offer\" button straight from the curators to lock in a price that works for you.",
    className: "card-red"
  }
];

const HomePage = () => {
  const firebase = useFirebase();
  const { isAdmin, isSiteOpen, toggleSiteStatus, user } = firebase; // Added user for potential future use
  // const { isSiteOpen, toggleSiteStatus } = useContext(SiteStatusContext);
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
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
        {/* <div className="menu-title">Menu</div> */}
        {/* <div className="cart-icon-container">
          <div className="cart-icon" onClick={() => navigate("/cart")}>🛒</div>
        </div> */}
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search grails, brands , aesthetics..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <main className="home-content">
        <section className="menu-hero" aria-labelledby="menu-hero-title">
          <h1 id="menu-hero-title">Welcome to <span class="highlight-word">stash360</span></h1>
          <p><bold>we don't make clothes, we make sure the good ones never die.</bold></p>
          <div className="menu-hero-actions">
            {/* <a href="#about-us">About us</a> */}
            <button
              type="button"
              className="btn-white"
              onClick={() => setShowAbout((prev) => !prev)}
            >
              {showAbout ? "About us \\/" : "About us /\\"}
            </button>


            <button
              type="button"
              onClick={() => document.getElementById("food-menu")?.scrollIntoView({ behavior: "smooth" })}
            >
              Browse and buy
            </button>

            <button
              type="button"
              className="btn-black"
              onClick={() => navigate("/seller-info")}
            >
              Become a seller
            </button>

          </div>
        </section>

      <div className={`about-section-wrapper${showAbout ? " about-section-wrapper--open" : ""}`}>
        <section id="about-us" className="about-section" aria-labelledby="about-title">
          <div className="about-copy">
          <p className="custom-paragraph">
            Thrifting in India has <span className="highlight-word">officially blown up </span> 
            and with it comes the chaos of unverified pages, inconsistent quality, and the dreaded instagram pages 'DM for price' games. 
            The culture is here, but the system and medium is <span className="highlight-word">BROKEN</span>
          </p> 
          
          <p className="section-kicker">We bring you India’s only CIRCULAR THRIFT MARKETPLACE.</p>
        </div>

        <details className="about-details" open>
          <summary>
          </summary>
            <span aria-hidden="true">Our Vision: To keep fashion on rotation and make true circularity the standard, not the exception. </span>
            <span aria-hidden="true">Our Mission: To expose the stash, verify the quality, and give you a transparent platform where what you see is what you get. </span>
          <div className="promise-grid">
        {circularPromises.map((promise) => (
          <article className={`promise-card ${promise.className}`} key={promise.title}>
            <div className="promise-icon">{promise.icon}</div>
            <h3>{promise.title}</h3>
            <p>{promise.description}</p>
          </article>
        ))}
      </div>
      </details>
      </section>
    </div>

        <section className="menu-stats" aria-label="Our food highlights">
          <div className="menu-stats-content">
            <h2>CHECK OUT OUR CURATORS</h2>
            <span><p className="curator-badge-text">
    🔥 50+ Premium Curators already dropping heat.</p></span>
          </div>
        </section>

      

      {/* Food Menu */}
      <section className="menu" id="food-menu">
        <div className="header">
        <div className="menu-title">Shop for Men</div>
      </div>

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
        </section>
        </main>
    </div>
  );
};

export default HomePage;