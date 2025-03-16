import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";

import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import CartFoodCard from "../components/CartFoodCard";
import { useNavigate } from "react-router-dom";
import "../pages/home.css";

const initialAddresses = [
  "Old OPD , Safdarjung Hospital , New Delhi, Delhi - 110029",
  "Main OPD , Safdarjung Hospital , New Delhi, Delhi - 110029",
  "NEB , Safdarjung Hospital , New Delhi, Delhi - 110029",
  "SSB , Safdarjung Hospital , New Delhi, Delhi - 110029",
  "SIC , Safdarjung Hospital , New Delhi, Delhi - 110029"
];


const Cart = () => {

  const paymentMethods = [
    {
      label: 'Online',
      value: 'online'
    },
    {
      label: 'COD',
      value: 'cash-on-delivery',
    },
  ]

  const firebase = useFirebase();
  const [data, setData] = useState([]);
  const [finalPrice, setFinalPrice] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(""); // State for selected address
  const [addresses, setAddresses] = useState(initialAddresses); // Available addresses
  const [landmark, setLandmark] = useState(""); // State for landmark
  const [cookingInstructions, setCookingInstructions] = useState(""); // State for cooking instructions
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash-on-delivery");




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



  const postBuyNow = async (orderId) => {
    console.log("BK pass 2");

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

    const fullAddress = selectedAddress;

    // ORDER PAYLOAD!!
    const orderPayload = {
      purchasedItems: purchasedItemsIds, // Store only the IDs of purchased items
      address: fullAddress,
      landmark,
      cookingInstructions: cookingInstructions, // Include cooking instructions
      deliveryPartnerId: 'EEqRTrY732ZaK27XRkjkJbjMq5E2', // default delivery partner id
    };

    console.log(orderPayload);

    console.log("BK orderId,orderPayload", orderId, orderPayload)
    await firebase.updateOrderStatus(orderId, orderPayload);

    // Clear the shopping cart after successful order creation
    await Promise.all(
      data.map((item) => firebase.removeDocumentWithId("shoppingCartItems", item.id))
    );
    // navigate(`/orders/${orderRef.id}`);
    navigate(`/orders`);
    firebase.displayToastMessage("Order Placed successfully!");
  }


  const showFailureAlert = () => {
    alert("payment failed");
    // Use sweetalert2
    // const this__ = this;
    // this.$swal({
    //   icon: 'error',
    //   title: 'Payment Failed',
    //   text: 'Try checkout again, you will be redirected to the cart',
    //   confirmButtonText: 'Continue'
    // })
    //   .then(function () {
    //     this__.$router.push({ name: 'cart' });
    //   });
  }

  const showSuccessAlert = () => {
    // Use sweetalert2
    // const this__ = this;
    // this.$swal({
    //   icon: 'success',
    //   title: 'Payment Sucessful',
    //   text: 'Thanks for purchasing from YIC! You can find your products in Dashboard. You will be redirected to Store',
    //   confirmButtonText: 'Continue'
    // }).then(function () {
    //   this__.$router.push({ name: 'store' });
    // });
    // alert("Payment Successful2!");

  };


  const handleCreateRazorpayPaymentsSuccess = async (payload) => {
    await firebase.createRazorpayPaymentsSuccess(payload);
    // postBuyNow();
    postBuyNow(payload.orderId);

  }

  const handlePayment = async (orderId) => {
    const orderRef = await firebase.getDocById(orderId, 'orders');
    const orderData = orderRef.data();

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with your actual Razorpay Key ID
        amount: orderData.finalPrice * 100,
        currency: 'INR',
        order_id: orderData.razorpayOrderId, // Order ID from Razorpay
        name: "Hotel Bites",
        description: "Order Payment",
        handler: function (response) {
          console.log("Payment Success:2", response);
          const payload3 = {
            razorpayOrderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            orderId,
          };
          console.log("payload3", payload3);
          handleCreateRazorpayPaymentsSuccess(payload3);
          showSuccessAlert();
        },
        prefill: { // fix prefill ..
          name: "",
          email: firebase?.user?.uid, // FIX
          contact: "",
        },
        theme: {
          color: "#3399cc",
        },
        retry: false,
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        showFailureAlert();
      });
      rzp.open();
    }
    catch (e) {
      console.log("error in handlePayment function  : ", e)
    }
  };



  const handleBuyNow = async () => {
    try {
      if (!selectedAddress) { firebase.displayToastMessage("Please select an address before placing the order.", "error"); return; }
      if (data.length === 0) return;

      const createOrderPayload = {
        finalPrice,
        paymentMethod
      }

      const torderId = await firebase.createOrder(createOrderPayload);

      if (paymentMethod === 'online') {
        await handlePayment(torderId);
      } else {
        postBuyNow(torderId);
      }

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

            {/* Payment Method Selection */}
            <div className="mt-3">
              <h5>Select Payment Method</h5>
              {paymentMethods.map((item, index) => (
                <div key={index} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id={item.value}
                    value={item.value}
                    checked={paymentMethod === item.value}
                    onChange={() => setPaymentMethod(item.value)}
                  />
                  <label htmlFor={item.value} className="form-check-label">{item.label}</label>
                </div>
              ))}
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