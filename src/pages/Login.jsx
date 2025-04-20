import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";

const LoginPage = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState(""); // State for password reset email
  const [showResetForm, setShowResetForm] = useState(false); // Toggle for reset form

  useEffect(() => {
    if (firebase.isLoggedIn) {
      // navigate to home
      navigate("/");
    }
  }, [firebase, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("login in a user...");
      const result = await firebase.singinUserWithEmailAndPass(email, password);
      console.log("Successful", result);
    } catch (err) {
      console.log("Unsuccessful", err.message, err);
      firebase.displayToastMessage(err.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await firebase.resetPassword(resetEmail);
      setShowResetForm(false); // Hide the reset form after success
    } catch (err) {
      console.log("Error resetting password:", err.message);
      firebase.displayToastMessage(err.message);
    }
  };

  return (
    <div className="container mt-5">
      {!showResetForm ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Enter email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Login
          </Button>

          <div className="mt-3">
            <Button
              variant="link"
              onClick={() => setShowResetForm(true)}
              className="p-0"
            >
              Forgot Password?
            </Button>
          </div>
        </Form>
      ) : (
        <Form onSubmit={handlePasswordReset}>
          <Form.Group className="mb-3" controlId="formResetEmail">
            <Form.Label>Enter your email to reset password</Form.Label>
            <Form.Control
              onChange={(e) => setResetEmail(e.target.value)}
              value={resetEmail}
              type="email"
              placeholder="Enter email"
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Send Reset Link
          </Button>

          <div className="mt-3">
            <Button
              variant="link"
              onClick={() => setShowResetForm(false)}
              className="p-0"
            >
              Back to Login
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default LoginPage;
