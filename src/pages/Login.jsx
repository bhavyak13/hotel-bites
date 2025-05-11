// c:\Users\hp\Documents\hotel-bites\src\pages\Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner"; // Import Spinner
import { useFirebase } from "../context/Firebase";
import './Login.css';

const LoginPage = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  // --- FIX: Add state to store confirmationResult ---
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (firebase.isLoggedIn) {
      navigate("/");
    }
  }, [firebase, navigate]);

  // --- Login Handlers ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      console.log("Logging in with email...");
      await firebase.singinUserWithEmailAndPass(email, password);
      console.log("Email login successful");
      // Navigation handled by useEffect
    } catch (err) {
      console.error("Email login failed:", err.message);
      firebase.displayToastMessage(`Login failed: ${err.message}`, "error");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    // Basic phone number validation (ensure it's a reasonable length)
    // Add country code prefix if not present (e.g., +91 for India)
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    if (!formattedPhoneNumber || formattedPhoneNumber.length < 11) { // e.g., +91 requires 13 digits total
      firebase.displayToastMessage("Please enter a valid 10-digit phone number.", "error");
      return;
    }
    setLoading(true); // Start loading
    try {
      console.log("Requesting OTP for:", formattedPhoneNumber);
      // --- FIX: Store the confirmation result ---
      const result = await firebase.sendOtp(formattedPhoneNumber);
      setConfirmationResult(result); // Store it in state
      console.log("OTP sent successfully.");
      firebase.displayToastMessage("OTP requested successfully!", "success");
      setOtpSent(true); // Show OTP input field
    } catch (err) {
      console.error("OTP request failed:", err);
      firebase.displayToastMessage(`OTP request failed: ${err.message || 'Unknown error'}`, "error");
      setOtpSent(false);
      setConfirmationResult(null); // Clear confirmation result on error
    } finally {
      setLoading(false); // Stop loading
    }
  };


  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { // Strict 6-digit OTP validation
      firebase.displayToastMessage("Please enter the 6-digit OTP.", "error");
      return;
    }
    // --- FIX: Check if confirmationResult exists ---
    if (!confirmationResult) {
      firebase.displayToastMessage("OTP session expired or invalid. Please request OTP again.", "error");
      setOtpSent(false); // Reset state to request again
      setOtp("");
      return;
    }

    setLoading(true); // Start loading
    try {
      console.log("Verifying OTP...");
      // --- FIX: Use the stored confirmationResult and the context's verifyOtp function ---
      const user = await firebase.verifyOtp(confirmationResult, otp);
      console.log("OTP verification successful:", user);
      // Navigation is handled by useEffect watching firebase.isLoggedIn
    } catch (err) {
      console.error("OTP verification failed:", err);
      firebase.displayToastMessage(`OTP login failed: ${err.message || 'Unknown error'}`, "error");
      // Optionally clear OTP input on failure: setOtp("");
    } finally {
      setLoading(false); // Stop loading
    }
  };


  // --- Password Reset Handler ---
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await firebase.resetPassword(resetEmail);
      firebase.displayToastMessage("Password reset link sent to your email!", "success");
      setShowResetForm(false); // Hide the reset form
      setResetEmail("");     // Clear the email input
    } catch (err) {
      console.error("Error resetting password:", err.message);
      firebase.displayToastMessage(`Password reset failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic ---

  // Render Password Reset Form
  if (showResetForm) {
    // ... (password reset form remains the same, maybe add loading state to button)
    return (
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-header-title">Reset Password</h2>
          <p className="login-header-subtitle">Enter your email to receive a reset link.</p>
          <Form onSubmit={handlePasswordReset} className="login-form">
            <Form.Group className="mb-3" controlId="formResetEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                onChange={(e) => setResetEmail(e.target.value)}
                value={resetEmail}
                type="email"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="btn-submit w-100 mb-3" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Send Reset Link'}
            </Button>

            <Button
              variant="link"
              onClick={() => setShowResetForm(false)}
              className="back-link"
              disabled={loading}
            >
              Back to Login
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  // Render Main Login Form (Email or Phone)
  return (
    <div className="login-container">
      <div className="login-box">
        {/* Header */}
        <div className="login-header">
          <h2 className="login-header-title">Login / Sign Up</h2>
          <p className="login-header-subtitle">Enter your phone number to get started</p>
        </div>

        {/* Toggle Buttons */}
        <div className="login-toggle mb-4">
          <button
            className={`toggle-button ${loginMethod === 'email' ? 'active' : ''}`}
            onClick={() => { setLoginMethod('email'); setOtpSent(false); setConfirmationResult(null); setOtp(""); setPhoneNumber(""); }}
            disabled={loading}
          >
            Email
          </button>
          <button
            className={`toggle-button ${loginMethod === 'phone' ? 'active' : ''}`}
            onClick={() => { setLoginMethod('phone'); setOtpSent(false); setConfirmationResult(null); setOtp(""); setEmail(""); setPassword(""); }}
            disabled={loading}
          >
            Phone Number
          </button>
        </div>

        {/* Login Forms */}
        {loginMethod === 'email' && (
          <Form onSubmit={handleEmailLogin} className="login-form">
            {/* Email Input */}
            <Form.Group className="mb-3" controlId="formLoginEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Enter email"
                required
                disabled={loading}
              />
            </Form.Group>

            {/* Password Input */}
            <Form.Group className="mb-4" controlId="formLoginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                required
                disabled={loading}
              />
            </Form.Group>

            {/* Submit Button */}
            <Button variant="primary" type="submit" className="btn-submit w-100" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Login'}
            </Button>

            {/* Forgot Password Link */}
            {/* <div className="text-center mt-3">
              <Button
                variant="link"
                onClick={() => setShowResetForm(true)}
                className="forgot-password-link"
                disabled={loading}
              >
                Forgot Password?
              </Button>
            </div> */}
            <div className="footer_basics mt-2" style={{color: "red"}}>
              Email featture is not avialable. Please use Phone number login
            </div>

          </Form>
        )}

        {loginMethod === 'phone' && (
          <Form onSubmit={otpSent ? handleOtpLogin : handleRequestOtp} className="login-form">
            {/* Phone Input */}
            <Form.Group className="mb-3" controlId="formPhoneNumber">
              <Form.Label>Phone Number (10 digits)</Form.Label>
              {/* Add placeholder or helper text for country code if needed */}
              <Form.Control
                onChange={(e) => setPhoneNumber(e.target.value)}
                value={phoneNumber}
                type="tel"
                placeholder="Enter 10-digit phone number"
                required
                disabled={otpSent || loading} // Disable phone input after requesting OTP or during loading
                maxLength={10} // Max length for 10 digits
              />
            </Form.Group>

            {/* OTP Input (conditional) */}
            {otpSent && (
              <Form.Group className="mb-4" controlId="formOtp">
                <Form.Label>OTP</Form.Label>
                <Form.Control
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  placeholder="Enter 6-digit OTP"
                  required
                  maxLength={6}
                  disabled={loading}
                />
              </Form.Group>
            )}

            {/* Submit/Request Button */}
            <Button variant="primary" type="submit" className="btn-submit w-100" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : (otpSent ? 'Verify OTP & Login' : 'Request OTP')}
            </Button>

            {/* Optionally add a way to resend OTP or change number */}
            {otpSent && !loading && (
              <Button
                variant="link"
                onClick={() => { setOtpSent(false); setConfirmationResult(null); setOtp(""); }}
                className="back-link mt-2"
                size="sm"
              >
                Change Number / Resend OTP
              </Button>
            )}
          </Form>
        )}

        {/* Create Account Link */}
        {/* <div className="create-account-link mt-4 text-center">
            Not registered yet? <Link to="/register">Create an Account</Link>
        </div> */}

      </div>
      {/* This div is needed for RecaptchaVerifier */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginPage;