import React, { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { Card, ListGroup, Alert, Spinner, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import OrderFoodCard from "../components/OrderFoodCard";

const ORDER_STATUSES = [
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const DeliveryPartnerOrderScreen = () => {
  const firebase = useFirebase();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // console.log("BK DeliveryPartnerOrderScreen orders:", orders);

  const getOrders = async () => {
    try {
      const deliveryAgentId = firebase?.user?.uid;
      // console.log("BK DeliveryPartnerOrderScreen deliveryAgentId", deliveryAgentId);
      const fetchedOrders = await firebase.fetchOrdersForDeliveryAgent(deliveryAgentId);
      // console.log("BK DeliveryPartnerOrderScreen fetchedOrders", fetchedOrders);

      // Map through orders and update each one's purchased items
      const ordersWithDetails = await Promise.all(
        fetchedOrders.map(async (order) => {
          const updatedPurchasedItems = await firebase.fetchPurchasedItemWithDetails(order.purchasedItems);
          return {
            ...order,
            purchasedItems: updatedPurchasedItems
          };
        })
      );

      // console.log("BK DeliveryPartnerOrderScreen ordersWithDetails", ordersWithDetails);
      // Sort orders by latest date (descending order)
      const sortedOrders = ordersWithDetails.sort((a, b) =>
        new Date(b._createdDate) - new Date(a._createdDate)
      );

      // console.log("BK DeliveryPartnerOrderScreen sortedOrders", sortedOrders);

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
    if (_createdDate)
      return new Date(_createdDate).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    else return "";
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
      <h3 className="mb-4">My Orders</h3>
      {orders?.map((order) => (
        <Card key={order.orderId} className="mb-3">
          <Card.Header>
            <h5>Order ID: {order.orderId}</h5>
          </Card.Header>
          <Card.Body>
            <h6>Status: {order.status}</h6>
            <h6>Final Price: ₹{order.finalPrice}</h6>
            <h6>Address: {order?.address}</h6>
            {order?._createdDate && (
              <h6>Created Date: {formattedDate(order?._createdDate)}</h6>
            )}
            {order?.paymentMethod && <h6>Payment Method: {order?.paymentMethod}</h6>}
            {order?.razorpayPaymentStatus && (
              <h6>Payment Status: {order?.razorpayPaymentStatus === 'Done' ? "Paid" : 'Pending'}</h6>
            )}

            <hr />
            <h6>Purchased Items:</h6>
            <ListGroup>
              {order.purchasedItems?.map((item, idx) => (
                <ListGroup.Item key={idx}>
                  <OrderFoodCard
                    key={item.id}
                    id={item.id}
                    {...item}
                    finalPrice={order?.finalPrice}

                  />
                </ListGroup.Item>
              ))}
            </ListGroup>

            {/* Add the QR Code Image */}
            <div className="text-center my-3">
              <img
                src="/paytm-qr.jpg"
                alt="QR Code"
                style={{ maxWidth: "200px", borderRadius: "8px" }}
              />
            </div>

            {/* Added buttons */}
            <Button
              onClick={() => {
                handleStatusChange(order.id, 'Delivered')
              }}
              variant="success"
              disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
            >
              Order delivered
            </Button>

            <Button
              onClick={() => {
                handleStatusChange(order.id, 'Cancelled')
              }}
              variant="danger"
              disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
            >
              Order Cancelled
            </Button>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default DeliveryPartnerOrderScreen;