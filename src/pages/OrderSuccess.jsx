import React, { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate, useParams } from "react-router-dom";
import { Card, ListGroup, Alert, Spinner } from "react-bootstrap";

const OrderSuccess = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const params = useParams();
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collectionName = "orders";
        const res = await firebase.getDocById(params.orderId, collectionName);
        setOrderData(res.data());
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.orderId, firebase]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <Alert variant="danger" className="mt-5">
        Order not found!
      </Alert>
    );
  }

  return (
    <div className="container mt-5">
      <Card>
        <Card.Header>
          <h4>Order ID: {orderData.orderId}</h4>
        </Card.Header>
        <Card.Body>
          <h5>Status: <span className="text-primary">{orderData.status}</span></h5>
          <h5>Final Price: ₹{orderData.finalPrice}</h5>
          <h6>User ID: {orderData.userId}</h6>
          <hr />
          <h5>Purchased Items:</h5>
          <ListGroup>
            {orderData.purchasedItems?.map((item, index) => (
              <ListGroup.Item key={index}>{item}</ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OrderSuccess;
