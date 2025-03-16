import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";

import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import CartFoodCard from "../components/CartFoodCard";
import { useNavigate } from "react-router-dom";
import "../pages/home.css";

import { v4 as uuidv4 } from 'uuid';


const initialAddresses = [
  "Old OPD , Safdarjung Hospital , New Delhi, Delhi - 110029",
  "Main OPD , Safdarjung Hospital , New Delhi, Delhi - 110029",
  "NEB , Safdarjung Hospital , New Delhi, Delhi - 110029",
  "SSB , Safdarjung Hospital , New Delhi, Delhi - 110029",
  "SIC , Safdarjung Hospital , New Delhi, Delhi - 110029"
];


const Cart = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]);
  const [finalPrice, setFinalPrice] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(""); // State for selected address
  const [addresses, setAddresses] = useState(initialAddresses); // Available addresses
  const [landmark, setLandmark] = useState(""); // State for landmark
  const [cookingInstructions, setCookingInstructions] = useState(""); // State for cooking instructions
  const [loading, setLoading] = useState(true);



  const fetchData = async () => {
    await firebase.fetchCartWithDetails("shoppingCartItems")
      .then((data) =>
        setData(data)
      );
    setLoading(false);

  }

  const handleRemoveDocument = async (id) => {
    await firebase.removeDocumentWithId("shoppingCartItems", id);
    await fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  const calculateFinalPrice = () => {
    const total = data.reduce((sum, item) => {
      const price = item?.variant?.priceOffer || item?.variant?.priceOriginal || 0;
      return sum + (item.quantity * price);
    }, 0);
    setFinalPrice(total);
  };

  useEffect(() => {
    if (data) {
      calculateFinalPrice();
    } else {
      setFinalPrice("Not found");
    }
  }, [data]);


  // console.log("BK cart data", data);
  const navigate = useNavigate();


  const generateUniqueId = () => {
    return uuidv4();
  };


  const handleBuyNow = async () => {
    if (!selectedAddress) {
      firebase.displayToastMessage("Please select an address before placing the order.", "error");
      return;
    }
    if (data.length === 0) return;

    try {
      // Add each item to the "purchasedItems" collection and store only their IDs
      const purchasedItemsIds = await Promise.all(
        data.map(async (item) => {
          const finalItem = {
            productId: item?.productId,
            variantId: item?.variantId,
            quantity: item?.quantity,
          };
          // console.log("BK finalItem", finalItem);
          const docRef = await firebase.handleCreateNewDoc(finalItem, "purchasedItems");
          return docRef.id; // Store only the document ID
        })
      );

      // Combine selected address with landmark
      const fullAddress = selectedAddress + landmark ?? `Landmark: ${landmark}`;

      // ORDER PAYLOAD!!
      const payload = {
        orderId: generateUniqueId(), // Generate a unique order ID
        status: "created",
        finalPrice: parseFloat(finalPrice),
        userId: firebase?.user?.uid || "",
        purchasedItems: purchasedItemsIds, // Store only the IDs of purchased items
        address: fullAddress,
        cookingInstructions: cookingInstructions, // Include cooking instructions
        _createdDate: new Date().toISOString(),
        deliveryPartnerId: 'EEqRTrY732ZaK27XRkjkJbjMq5E2', // default delivery partner id
      };

      const orderRef = await firebase.handleCreateNewDoc(payload, "orders");

      // Clear the shopping cart after successful order creation
      await Promise.all(
        data.map((item) => firebase.removeDocumentWithId("shoppingCartItems", item.id))
      );
      // navigate(`/orders/${orderRef.id}`);
      navigate(`/orders`);
      firebase.displayToastMessage("Order Placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };



  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>loading Cart..</p>
      </div>
    );
  }
  // dummy commit


  return (
    <div className="home-page">
      {/* Advertisement Space */}
      <div className="ad-container">Advertising space</div>

      {/* Header */}
      <div className="header">
        <div className="order-summary">Cart</div>
      </div>

      {!data || data?.length === 0
        ? <Alert key={"info"} variant={"info"}>
          Cart Empty!
        </Alert>
        : (
          <>
            <CardGroup>
              {data?.map((book) => (
                <CartFoodCard
                  key={book.id}
                  id={book.id}
                  handleRemoveDocument={handleRemoveDocument}
                  {...book}
                />
              ))}
            </CardGroup>

            {/* Cooking Instructions Input */}
            <Form.Group className="mt-3">
              <Form.Label>Enter Cooking Instructions/Preferences</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter any specific cooking instructions"
                value={cookingInstructions}
                onChange={(e) => setCookingInstructions(e.target.value)}
              />
            </Form.Group>

            {/* Address Dropdown */}
            <Form.Group className="mt-3">
              <Form.Label>Select Delivery Address</Form.Label>
              <Form.Select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
              >
                <option value="">-- Select Address --</option>
                {addresses.map((address, index) => (
                  <option key={index} value={address}>
                    {address}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Landmark Input */}
            <Form.Group className="mt-3">
              <Form.Label>Enter Landmark</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter landmark near the address"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </Form.Group>

            <div className="final-price">
              final price : {finalPrice}
            </div>
            <Button onClick={() => handleBuyNow()} variant="primary">
              Place Order
            </Button>
          </>
        )

      }
    </div>
  );
};

export default Cart;