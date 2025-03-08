import React, { useEffect, useState } from "react";
import "../styles/Admin.css"; // Ensure the CSS file exists and is styled properly

const AdminScreen = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders") // Replace with actual API endpoint
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const handleProcess = (orderId) => {
    // Implement order processing logic
    console.log("Processing order:", orderId);
  };

  const handleUpdateStatus = (orderId) => {
    // Implement status update logic
    console.log("Updating order status:", orderId);
  };

  const handleCancel = (orderId) => {
    // Implement cancel logic
    console.log("Cancelling order:", orderId);
  };

  return (
    <div className="admin-container">
      <h2>QuickEats Admin</h2>
      <div className="tab-menu">
        <button className="active">Self-Checkout</button>
        <button>Delivery</button>
      </div>
      <div className="orders-section">
        <h3>Self/Assisted Checkout</h3>
        {orders.filter(order => order.type === "self-checkout").map((order) => (
          <div key={order.id} className="order-card">
            <p><strong>Order #{order.id}</strong></p>
            <p>Items: {order.items.length}</p>
            <p>Total: ${order.total.toFixed(2)}</p>
            <button onClick={() => handleProcess(order.id)}>Process</button>
          </div>
        ))}
      </div>
      <div className="orders-section">
        <h3>Delivery</h3>
        {orders.filter(order => order.type === "delivery").map((order) => (
          <div key={order.id} className="order-card">
            <p><strong>Order #{order.id}</strong></p>
            <p>Status: {order.status}</p>
            <button onClick={() => handleUpdateStatus(order.id)}>Update</button>
            <button onClick={() => handleCancel(order.id)}>Cancel</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminScreen;
