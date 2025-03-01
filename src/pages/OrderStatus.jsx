import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./OrderStatus.css";

const OrderStatus = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        "Order Confirmed",
        "Preparing Your Order",
        "Ready for Pickup",
        "Order Complete"
    ];

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                const response = await axios.get(`/api/orders/${orderId}`);
                setOrder(response.data);
                setCurrentStep(response.data.statusIndex);
            } catch (error) {
                console.error("Error fetching order status:", error);
            }
        };
        fetchOrderStatus();

        const interval = setInterval(fetchOrderStatus, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    return (
        <div>
            <div className="header">
                <div className="ad-container">Advertising Space</div>
                <h1>Order Status</h1>
            </div>

            <div className="status-container">
                {order ? (
                    <>
                        <div className="order-confirmed">
                            <div className="checkmark">✓</div>
                            <h2 className="confirmation-title">Order Confirmed!</h2>
                            <p className="order-number">Order #{order.id}</p>
                        </div>

                        <div className="status-card">
                            <h3 className="status-title">Order Progress</h3>
                            <div className="status-timeline">
                                <div className="timeline-line"></div>
                                {steps.map((step, index) => (
                                    <div key={index} className="status-step">
                                        <div
                                            className={`step-dot ${index < currentStep ? "completed" : ""} ${index === currentStep ? "active pulse" : ""}`}
                                        ></div>
                                        <div className="step-content">
                                            <div className="step-title">{step}</div>
                                            <div className="step-time">{index <= currentStep ? order.timestamps[index] : "-"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="estimated-time">
                                <div className="estimated-time-title">Estimated Time</div>
                                <div className="estimated-time-value">{order.estimatedTime} mins</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Loading order details...</p>
                )}
            </div>

            <nav className="bottom-nav">
                <a href="/" className="nav-item">Home</a>
                <a href="/menu" className="nav-item">Menu</a>
                <a href="/orders" className="nav-item active">Orders</a>
            </nav>
        </div>
    );
};

export default OrderStatus;
