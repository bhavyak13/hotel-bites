import React, { useEffect, useState, useRef } from "react";
import { useFirebase } from "../context/Firebase";
import { Card, ListGroup, Alert, Spinner, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import OrderFoodCard from "../components/OrderFoodCard";

const ORDER_STATUSES = [
  "Created",
  // "Processing",
  "Preparing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const OrdersComponent = ({ isAdminView }) => {
  const firebase = useFirebase();
  const [orders, setOrders] = useState([]);
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
      const fetchedOrders = isAdminView ? await firebase.fetchAllOrders() : await firebase.fetchOrders();
      const ordersWithDetails = await Promise.all(
        fetchedOrders.map(async (order) => {
          const updatedPurchasedItems = await firebase.fetchPurchasedItemWithDetails(order.purchasedItems);
          const phoneNumber = await firebase.fetchPhoneNumber(order.userId);
          return { ...order, purchasedItems: updatedPurchasedItems, phoneNumber };
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
  }, [firebase]);

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
    printWindow.document.write(printContent.innerHTML);
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
      {orders?.map((order) => (
        <Card key={order.orderId} className="mb-3">
          <Card.Header>
            <h5>Order ID: {order.orderId}</h5>
          </Card.Header>
          <Card.Body id={`order-${order.orderId}`} ref={printRef}>
            <h6>
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
            <h6>Phone Number: {order.phoneNumber || "N/A"}</h6>
            <h6>Final Price: ₹{order.finalPrice}</h6>
            {order.cookingInstructions && <h6><strong>Cooking Instructions:</strong> <span style={{ color: "red" }}>{order.cookingInstructions}</span></h6>}
            <h6>Address: {order?.address}</h6>
            {isAdminView && <h6>Delivery Partner ID: {order?.deliveryPartnerId}</h6>}
            {order?._createdDate && <h6>Created Date: {formattedDate(order?._createdDate)}</h6>}
            {order?.paymentMethod && <h6>Payment Method: {order?.paymentMethod}</h6>}
            {order?.razorpayPaymentStatus &&
              <h6>Payment Status: {order?.razorpayPaymentStatus === 'Done' ? "Paid" : 'Pending'}</h6>
            }
            <hr />
            <h6>Purchased Items:</h6>
            <ListGroup>
              {order.purchasedItems?.map((item, idx) => (
                <ListGroup.Item key={idx}>
                  <OrderFoodCard key={item.id} id={item.id} {...item} finalPrice={order?.finalPrice} />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
          {!isAdminView && (
            <Card.Footer>
              <Button variant="secondary" onClick={() => handlePrint(order.orderId)}>
                Print Order
              </Button>
            </Card.Footer>
          )}
        </Card>
      ))}
    </div>
  );
};

export default OrdersComponent;
