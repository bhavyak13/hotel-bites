import React, { useEffect, useState } from "react";
import { useFirebase } from "../../context/Firebase";
import { Card, Button, Form, Spinner, Alert } from "react-bootstrap";

const AddNewAddress = () => {
  const firebase = useFirebase();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedAddresses = await firebase.fetchAddresses(); // Fetch addresses
        setAddresses(fetchedAddresses);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [firebase]);

  const handleAddAddress = async () => {
    try {
      const newAddressData = { address: newAddress };
      await firebase.handleCreateNewDoc(newAddressData, "delivery_addresses");
      setNewAddress(""); // Clear the input field
      const updatedAddresses = await firebase.fetchAddresses(); // Refresh the addresses
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await firebase.removeDocumentWithId("delivery_addresses", id);
      const updatedAddresses = await firebase.fetchAddresses(); // Refresh the addresses
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Manage Addresses</h3>

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