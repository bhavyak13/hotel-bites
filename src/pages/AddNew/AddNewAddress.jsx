import React, { useState, useEffect } from "react";
import { useFirebase } from "../../context/Firebase";
import { Card, Button, Form, Spinner, Alert } from "react-bootstrap";

const AddNewAddress = () => {
  const firebase = useFirebase();
  const [newAddress, setNewAddress] = useState(""); // State for the new address input
  const [addresses, setAddresses] = useState([]); // State for all addresses
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch all addresses from Firestore
    const fetchAddresses = async () => {
        setLoading(true);
        try {
          // const userId = firebase.getUserId(); // No longer needed for fetching ALL addresses
          // console.log("Fetching all addresses (Admin View)"); // Optional: Update log message
    
          // Fetch ALL documents from the collection, without filtering by userId
          const snapshot = await firebase.db
            .collection("delivery_addresses")
            .get(); // <-- Removed the .where("userId", "==", userId) clause
    
          const addressesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          console.log("Fetched Addresses:", addressesData); // Debugging
          setAddresses(addressesData);
        } catch (error) {
          console.error("Error fetching addresses:", error);
          // Consider adding user feedback here, e.g., using a toast message
          firebase.displayToastMessage("Error loading addresses.", "error");
        } finally {
          setLoading(false);
        }
      };
    

  // Add a new address to Firestore
  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      alert("Address cannot be empty!");
      return;
    }

    const payload = {
      address: newAddress,
      userId: firebase.getUserId(), // Ensure userId is stored
    };

    await firebase.handleCreateNewDoc(payload, "delivery_addresses");
    setNewAddress("");
    fetchAddresses();
  };

  // Delete an address from Firestore
  const handleDeleteAddress = async (id) => {
    await firebase.removeDocumentWithId("delivery_addresses", id); // Updated collection name
    fetchAddresses(); // Refresh the address list
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Manage Addresses</h3>

      {/* Input for adding a new address */}
      <Form.Group className="mb-3">
        <Form.Label>Enter New Address</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" onClick={handleAddAddress}>
        Add Address
      </Button>

      {/* Card-based layout for displaying addresses */}
      <h4 className="mt-5">Existing Addresses</h4>
      {loading ? (
        <div className="text-center mt-3">
          <Spinner animation="border" />
          <p>Loading addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <Alert variant="info" className="mt-3">
          No addresses found.
        </Alert>
      ) : (
        <div className="d-flex flex-wrap mt-3">
          {addresses.map((address, index) => (
            <Card key={address.id} className="m-2" style={{ width: "18rem" }}>
              <Card.Body>
                <Card.Title>Address #{index + 1}</Card.Title>
                <Card.Text>{address.address || "No address provided"}</Card.Text>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  Delete
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddNewAddress;