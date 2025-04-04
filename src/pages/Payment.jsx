import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useFirebase } from '../context/Firebase';
import { useNavigate } from 'react-router-dom';
import './Payment.css';  

const PaymentPage = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!firebase?.user) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const order = await firebase.getPendingOrder(); // Implement this in context/Firebase.js
        if (order) {
          setOrderData(order);
        } else {
          setError('No order found.');
          navigate('/');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [firebase, navigate]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === 'online') {
        console.log('Initiating online payment...');
        await firebase.processOnlinePayment(orderData); // Implement in context/Firebase.js
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay
        console.log('Online payment successful!');
        await firebase.markOrderPaid(orderData.orderId, 'online'); // Implement in context/Firebase.js
        navigate('/OrderSuccess'); // Corrected path, assuming this exists
      } else if (paymentMethod === 'cash') {
        await firebase.markOrderPaid(orderData.orderId, 'cash'); // Implement in context/Firebase.js
        navigate('/OrderSuccess'); // Corrected path, assuming this exists
      }
    } catch (err) {
      setError(err.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  if (!orderData) {
    return <div className="text-center mt-5">No order data available.</div>;
  }

  return (
    <div className="delivery-page">
      <h1 className="page-title">Delivery & Payment</h1>

      <div className="order-summary">
        <h2>Order Summary</h2>
        <p>Order ID: {orderData.orderId}</p>
        <p>Delivery Address: {orderData.deliveryAddress}</p>
        <ul>
          {orderData.items.map((item) => (
            <li key={item.name}>
              {item.name} x {item.quantity} - ${item.price}
            </li>
          ))}
        </ul>
        <p>Total: ${orderData.totalPrice.toFixed(2)}</p>
      </div>

      <div className="payment-options">
        <h2>Payment Options</h2>
        <div className="paytm-section">
          <img
            src="public/images/paytm-qr.png"  
            alt="Paytm QR Code"
            className="paytm-qr"
          />
          <p>Scan to pay with Paytm</p>
        </div>

        <div className="payment-buttons">
          <Button
            variant={paymentMethod === 'online' ? 'primary' : 'outline-primary'}
            onClick={() => setPaymentMethod('online')}
            className="payment-button"
            disabled={loading}
          >
            Online Payment
          </Button>
          <Button
            variant={paymentMethod === 'cash' ? 'primary' : 'outline-primary'}
            onClick={() => setPaymentMethod('cash')}
            className="payment-button"
            disabled={loading}
          >
            Cash on Delivery
          </Button>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        className="confirm-payment-button"
        disabled={!paymentMethod || loading}
      >
        {loading ? 'Processing...' : 'Confirm Payment'}
      </Button>
    </div>
  );
};

export default PaymentPage;
