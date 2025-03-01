import React, { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { Card, ListGroup, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const firebase = useFirebase();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { fetchOrders } = useFirebase();


  const navigate = useNavigate();

  useEffect(() => {
    if (!firebase?.user) { // if not admin 
      navigate("/login");
    }
  }, [firebase, navigate]);

  useEffect(() => {
    const getOrders = async () => {
      const orders = await fetchOrders();
      console.log("Fetched Orders:", orders);
      setOrders(orders);
      setLoading(false);
    };
    getOrders();
    
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <Alert variant="warning" className="mt-5 text-center">
        You have no orders yet.
      </Alert>
    );
  }

  return (
    <div className="container mt-5">
      <h3 className="mb-4">My Orders</h3>
      {orders.map((order, index) => (
        <Card key={index} className="mb-3">
          <Card.Header>
            <h5>Order ID: {order.orderId}</h5>
          </Card.Header>
          <Card.Body>
            <h6>Status: <span className="text-primary">{order.status}</span></h6>
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

export default MyOrders;
