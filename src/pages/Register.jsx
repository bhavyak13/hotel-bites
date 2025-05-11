import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";

const RegisterPage = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // State for phone number
  const [allfieldsfilled, setallfieldsfilled] = useState(false);

  useEffect(() => {
    const isValidPhone = /^\d{10}$/.test(phoneNumber); // Simple 10-digit check
    if (!email || !password || !isValidPhone) {
      setallfieldsfilled(false);
    } else {
      setallfieldsfilled(true);
    }
  }, [email, password, phoneNumber]);


  useEffect(() => {
    if (firebase.isLoggedIn) {
      // Navigate to home
      navigate("/");
    }
  }, [firebase, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!allfieldsfilled) {
        firebase.displayToastMessage("Please fill all fields");
        return;
      }
      console.log("Signing up a user...");
      const result = await firebase.signupUserWithEmailAndPassword(email, password);

      // Save additional user details (e.g., phone number) in Firestore
      await firebase.saveUserDetails(result.user.uid, { email, phoneNumber });

      console.log("Successfully registered:", result);
      firebase.displayToastMessage("Account created successfully!");
      navigate("/");
    } catch (err) {
      console.log("Unsuccessful registration:", err.message, err);
      firebase.displayToastMessage(err.message);
    }
  };



  return (
    <div className="container mt-5">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Enter email"
          />
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPhone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter 10-digit phone number"
            value={phoneNumber}
            onChange={(e) => {
              const input = e.target.value;
              // Allow only digits
              if (/^\d*$/.test(input)) {
                setPhoneNumber(input);
              }
            }}
            maxLength={10}
            required
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

        <Button variant="primary" type="submit" disabled={!allfieldsfilled}>
          Create Account
        </Button>
      </Form>
    </div>
  );
};

export default RegisterPage;
