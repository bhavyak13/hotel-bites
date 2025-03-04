import React, { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { Card, ListGroup, Alert, Spinner, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ORDER_STATUSES = [
  "Created",
  // "Processing",
  "Preparing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const AllOrders = () => {
  const firebase = useFirebase();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!firebase?.isAdmin) {
      navigate("/");
    }
  }, [firebase, navigate]);

  const getOrders = async () => {

    const fetchedOrders = await firebase.fetchAllOrders();

    // Ensure each order has an 'id' field
    const ordersWithId = fetchedOrders.map(order => ({
      id: order.id,  // Firebase document ID
      ...order
    }));

    setOrders(ordersWithId);
    setLoading(false);
  };

  useEffect(() => {
    

    getOrders();
  }, [firebase]);


  const handleStatusChange = async (orderId, newStatus) => {
    setLoading(true);
    await firebase.updateOrderStatus(orderId, newStatus);
    await getOrders();
    setLoading(false);
    
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <Alert variant="warning" className="mt-5 text-center">
        No orders found.
      </Alert>
    );
  }

  return (
    <div className="container mt-5">
      <h3 className="mb-4">All Orders</h3>
      {orders.map((order) => (
        <Card key={order.orderId} className="mb-3">
          <Card.Header>
            <h5>Order ID: {order.orderId}</h5>
          </Card.Header>
          <Card.Body>
            <h6>
              Status:
              {firebase?.isAdmin ? (
                <Form.Select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="ms-2 d-inline w-auto"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <span className="text-primary ms-2">{order.status}</span>
              )}
            </h6>
            <h6>Final Price: ₹{order.finalPrice}</h6>
            <hr />
            <h6>Purchased Items:</h6>
            <ListGroup>
              {order.purchasedItems?.map((item, idx) => (
                <ListGroup.Item key={idx}>{item}</ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default AllOrders;
