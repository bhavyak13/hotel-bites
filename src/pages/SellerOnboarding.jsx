import React, { useState } from 'react';
import './SellerOnboarding.css';

const SellerOnboarding = () => {
  const [activeColor, setActiveColor] = useState('');

  const colors = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#6b7280', '#8b4513'];

  return (
    <div className="onboarding-page">
      {/* Hero Banner */}
      <div className="onboarding-hero">
        <h1>Cash your stash.</h1>
        <p>Keep fashion circular.</p>
        <div className="hero-badges">
          <span>✓ 0% commission fees</span>
          <span>✓ Hassle-free payouts</span>
          <span>✓ Prepaid shipping labels</span>
        </div>
      </div>

      <div className="onboarding-container">
        <div className="breadcrumb">Home / Onboarding</div>
        
        <h2 className="section-title">Curator's Shop Profile</h2>
        <p className="section-subtitle">Set up your storefront. You only need to do this once.</p>

        {/* Shop Profile Form */}
        <div className="form-section">
          <label className="form-label">SHOP BANNER & LOGO PROFILES</label>
          <div className="upload-box main-upload">
            <span className="upload-icon">☁️</span>
            <p>Upload shop banner and logo images</p>
            <small>PNG, JPG up to 5MB</small>
          </div>

          <label className="form-label">SHOP / CURATOR NAME</label>
          <input type="text" className="form-input" placeholder="e.g., Vintage Vault by Sarah" />

          <label className="form-label">SOCIAL MEDIA LINKAGES</label>
          <div className="social-grid">
            <div className="social-card">
              <span className="social-icon">📷</span>
              <div>
                <strong>Instagram</strong>
                <p>Link your IG storefront</p>
              </div>
            </div>
            <div className="social-card">
              <span className="social-icon">🎵</span>
              <div>
                <strong>Spotify Playlist</strong>
                <p>Set your shop's vibe</p>
              </div>
            </div>
            <div className="social-card">
              <span className="social-icon">💬</span>
              <div>
                <strong>WhatsApp</strong>
                <p>For quick support</p>
              </div>
            </div>
          </div>

          <label className="form-label">RETURN / REFUND POLICIES</label>
          <div className="policy-grid">
            <select className="form-input">
              <option>No returns accepted</option>
              <option>7-day returns</option>
            </select>
            <input type="text" className="form-input" placeholder="Other policy details..." />
          </div>
        </div>

        {/* Item Upload Section */}
        <h2 className="step-title">1. Snap your stash</h2>
        <p className="section-subtitle">Add up to 6 photos. Show the front, back, tags, and any flaws.</p>
        
        <div className="photo-grid">
          {['Front Image', 'Back Image', 'Brand Tag', 'Size Tag', 'Detail / Flaw', 'Styled / Worn'].map((label, idx) => (
            <div className="upload-box small-upload" key={idx}>
              <span className="upload-icon">📷</span>
              <p>{label}</p>
            </div>
          ))}
        </div>

        {/* Details Section */}
        <h2 className="step-title">2. The Details</h2>
        <div className="form-section">
          <label className="form-label">ITEM TITLE</label>
          <input type="text" className="form-input" placeholder="e.g., Vintage Y2K Nike Windbreaker" />

          <label className="form-label">CATEGORY</label>
          <select className="form-input">
            <option>Select a category...</option>
            <option>Outerwear</option>
            <option>Tops</option>
            <option>Bottoms</option>
          </select>

          <label className="form-label">BRAND</label>
          <input type="text" className="form-input" placeholder="e.g., Nike, Zara, Unbranded" />
        </div>

        {/* Visibility Section */}
        <h2 className="step-title">3. Boost your visibility</h2>
        <div className="form-section">
          <label className="form-label">COLOR</label>
          <div className="color-picker">
            {colors.map((color) => (
              <button 
                key={color}
                className={`color-swatch ${activeColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setActiveColor(color)}
                type="button"
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>

          <label className="form-label">SIZE & CONDITION</label>
          <input type="text" className="form-input" placeholder="e.g., Medium / Gently Used" />
        </div>

        <button className="submit-btn" type="button">Start Selling</button>
      </div>
    </div>
  );
};

export default SellerOnboarding;