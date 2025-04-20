import React, { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useFirebase } from "../context/Firebase";
import { Button, Form, Alert } from "react-bootstrap";

const OtpLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha verified");
        },
      },
      firebaseAuth
    );
  };

  const handleSendOtp = async () => {
    setError("");
    if (!phoneNumber) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        firebaseAuth,
        phoneNumber,
        appVerifier
      );
      setVerificationId(confirmationResult.verificationId);
      alert("OTP sent successfully!");
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      const credential = await confirmationResult.confirm(otp);
      console.log("User signed in successfully:", credential.user);
      setSuccess(true);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h3>OTP Login</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Login successful!</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control
          type="tel"
          placeholder="+91 1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={!!verificationId}
        />
      </Form.Group>
      {!verificationId && (
        <Button onClick={handleSendOtp} variant="primary">
          Send OTP
        </Button>
      )}

      {verificationId && (
        <>
          <Form.Group className="mt-3">
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </Form.Group>
          <Button onClick={handleVerifyOtp} variant="success">
            Verify OTP
          </Button>
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default OtpLogin;