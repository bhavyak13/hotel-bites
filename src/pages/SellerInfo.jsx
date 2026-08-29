import React from 'react';
import './SellerInfo.css';
import { useNavigate } from 'react-router-dom';

const trustReasons = [
  {
    icon: "%",
    title: "0% Commission. 100% Yours.",
    description: "List for free and keep every single rupee you earn from selling your stash. Only pay a tiny micro-fee if you choose to 'Bump' your drop to the top of the feed.",
    className: "half-width"
  },
  {
    icon: "📈",
    title: "Build Your Brand Name.",
    description: "Don't just sell clothes, build a cult following. Cultivate your own aesthetic, gain loyal followers, and scale your business inside our Gen-Z ecosystem.",
    className: "half-width"
  },
  {
    icon: "📣",
    title: "Omnichannel Hype.",
    description: "You reel in the grabs, we bring the eyeballs. Top curators get featured across our official Instagram, LinkedIn, X, and YouTube. Free marketing, massive reach.",
    className: "half-width"
  },
  {
    icon: "📦",
    title: "Ship Your Way.",
    description: "Total flexibility. Want to maintain control? Choose Self-Shipping. Want zero stress? Use stash360's discounted prepaid labels and just drop it off.",
    className: "half-width"
  },
  {
    icon: "💬",
    title: "No More DM Fiascos.",
    description: "Say goodbye to 'Is this available?', fake UPI screenshots, and ghosting buyers. Run a 24/7 automated storefront so you can sleep while you sell.",
    className: "full-width"
  }
];

const SellerInfo = () => {
    const navigate = useNavigate();
  return (
    <div className="sell-page">
      {/* Hero Section */}
      <section className="sell-hero">
        <div className="sell-hero-content">
          <h1>Turn your closet<br />into an empire.</h1>
          <p>
            Join India's fastest-growing circular fashion community. We bring the audience, you 
            bring the heat. Set up your automated storefront in 60 seconds.
          </p>
          <button className="btn-primary" onClick={() => navigate("/seller-onboarding")}>Start Selling Now →</button>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <h2>The 5 Reasons to <span className="text-red">TRUST stash360</span></h2>
        
        <div className="trust-grid">
          {trustReasons.map((reason, index) => (
            <article className={`trust-card ${reason.className}`} key={index}>
              <div className="trust-icon-wrapper">
                <span className="trust-icon">{reason.icon}</span>
              </div>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bottom-cta">
        <div className="cta-text">
          <h2>Ready to cash your stash?</h2>
          <p>Your storefront is 60 seconds away.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/seller-onboarding")}>Create Your Shop &<br/>List your items</button>
      </section>
    </div>
  );
};

export default SellerInfo;