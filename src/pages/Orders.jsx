import React, { useEffect, useState, useRef } from "react";
import { useFirebase } from "../context/Firebase";
import { Card, ListGroup, Alert, Spinner, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import OrderFoodCard from "../components/OrderFoodCard";
import "../pages/orders.css";

const ORDER_STATUSES = [
  "Created",
  // "Processing",
  "Preparing",
  // "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const OrdersComponent = ({ isAdminView }) => {
  const firebase = useFirebase();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // State for filtered orders
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const printRef = useRef(null);

  useEffect(() => {
    if (isAdminView && !firebase?.isAdmin) {
      navigate("/");
    }
  }, [firebase, isAdminView, navigate]);

  const getOrders = async () => {
    try {
      const fetchedOrders = isAdminView
        ? await firebase.fetchAllOrders()
        : await firebase.fetchOrders();

      const ordersWithDetails = await Promise.all(
        fetchedOrders.map(async (order) => {
          const updatedPurchasedItems = await firebase.fetchPurchasedItemWithDetails(order.purchasedItems);
          return { ...order, purchasedItems: updatedPurchasedItems };
        })
      );

      const sortedOrders = ordersWithDetails.sort((a, b) => new Date(b._createdDate) - new Date(a._createdDate));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  
    // Listen for new orders
    const unsubscribe = firebase.listenForNewOrders((newOrders) => {
      if (newOrders.length > 0) {
        // Play notification sound and display toast message for specific roles
        if (!(firebase?.user && !firebase?.isAdmin && !firebase?.isDeliveryPartner)) {
          firebase.playNotificationSound(); // Play the notification sound
          firebase.displayToastMessage("New order received!");
        }
  
        // Add new orders to the list
        setOrders((prevOrders) => [...newOrders, ...prevOrders]);
      }
    });
  
    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [firebase]);

  useEffect(() => {
    setFilteredOrders(orders); // Sync filtered orders with all orders
  }, [orders]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = orders.filter((order) =>
      order.orderId.toLowerCase().includes(query) ||
      order.phoneNumber?.toLowerCase().includes(query) ||
      order.address?.toLowerCase().includes(query)
    );

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setLoading(true);
    await firebase.updateOrderStatus(orderId, { status: newStatus });
    await getOrders();
    setLoading(false);
  };

  const formattedDate = (_createdDate) => {
    return _createdDate ? new Date(_createdDate).toLocaleString('en-GB', {
      year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) : "";
  };

  const handlePrint = (orderId) => {
    const printContent = document.getElementById(`order-${orderId}`);
    const printWindow = window.open("", "_blank");
    // Add print-specific CSS for larger, bold, black text
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Print</title>
          <style>
            body {
              font-size: 20px;
              font-weight: bold;
              color: #000 !important;
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h5, h6, strong, span, p {
              font-size: 20px !important;
              font-weight: bold !important;
              color: #000 !important;
            }
            hr {
              border: 1px solid #000;
            }
            .text-primary, .text-success, .text-danger, .text-warning {
              color: #000 !important;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <Alert variant="warning" className="mt-5 text-center">
        No orders found.
      </Alert>
    );
  }

  return (
    <div className="container mt-5">
      <h3 className="mb-4">{isAdminView ? "All Orders" : "My Orders"}</h3>

            {/* Search Bar */}
      <div className="search-container mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search orders by ID, phone number, or address..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {filteredOrders?.map((order) => (
        <Card key={order.orderId} className="order-card">
          <div className="order-card-header">
            Order ID: {order.orderId}
          </div>
          <div className="order-card-body" id={`order-${order.orderId}`} ref={printRef}>
            <h6 className="order-details">
              Status:
              {firebase?.isAdmin ? (
                <Form.Select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="ms-2 d-inline w-auto"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              ) : (
                <span className="text-primary ms-2">{order.status}</span>
              )}
            </h6>
            <h6 className="order-details">Phone Number: {order?.phoneNumber || "N/A"}</h6>
            <h6 className="order-details">Final Price: ₹{order.finalPrice}</h6>
            {order.cookingInstructions && (
              <h6 className="order-details">
                <strong>Cooking Instructions:</strong>
                <span style={{ color: "red" }}> {order.cookingInstructions}</span>
              </h6>
            )}
            <h6 className="order-details">
              <strong>
                Address:
                {order?.landmark && (
                  <span style={{ fontStyle: "italic", color: "green" }}>
                    {" "}{order.landmark} ,
                  </span>
                )}
                {order?.address}
              </strong>
            </h6>
            {isAdminView && <h6 className="order-details">Delivery Partner ID: {order?.deliveryPartnerId}</h6>}
            {order?._createdDate && <h6 className="order-details">Created Date: {formattedDate(order?._createdDate)}</h6>}
            {order?.paymentMethod && <h6 className="order-details">Payment Method: {order?.paymentMethod}</h6>}
            {order?.razorpayPaymentStatus &&
              <h6 className="order-details">Payment Status: {order?.razorpayPaymentStatus === 'Done' ? "Paid" : 'Pending'}</h6>
            }
            <hr />
            <div className="order-section-title">Purchased Items:</div>
            <ListGroup className="order-items-list">
              {order.purchasedItems?.map((item, idx) => (
                <ListGroup.Item key={idx} className="order-item">
                  {item ? (
                    <OrderFoodCard
                      key={item.id}
                      id={item.id}
                      {...item}
                      finalPrice={order?.finalPrice}
                    />
                  ) : (
                    <p>Item details are missing.</p>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <hr />
            <div className="order-total-section">
              Total Bill: ₹{order.finalPrice}
            </div>
          </div>
          {firebase?.isAdmin && (
            <div className="order-card-footer">
              <Button variant="secondary" onClick={() => handlePrint(order.orderId)}>
                Print Order
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default OrdersComponent;