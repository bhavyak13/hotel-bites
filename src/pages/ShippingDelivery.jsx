import React from "react";

const ShippingPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Shipping Policy</h1>
      <p className="mb-4">
        This shipping policy explains how <strong>Kalra Caterers</strong> operates its shipping procedures and how we strive to meet your expectations with every order. Whether you're a first-time buyer or a returning customer, we want to ensure that your experience with us is smooth and satisfactory, right from placing your order to the moment it arrives at your doorstep. This policy has been created with the help of the shipping policy generator.
      </p>
      <p className="mb-6">
        Please read this shipping policy together with our terms and conditions to familiarize yourself with the rest of our general guidelines.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Table of Contents</h2>
      <ul className="list-disc list-inside mb-8">
        <li>Shipping and Delivery Options</li>
        <li>Delayed Orders</li>
        <li>Returns and Exchanges</li>
        <li>Contact Information</li>
      </ul>

      <h2 className="text-3xl font-semibold mb-4">Shipping and Delivery Options</h2>
      <p className="mb-4">
        We offer a variety of shipping options to suit the needs of our customers.
      </p>
      <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
      <p className="mb-4">
        As part of our commitment to an exceptional shopping experience, we are pleased to offer free shipping for orders over ₹100.
      </p>
      <h3 className="text-xl font-semibold mb-2">Shipping Methods</h3>
      <ul className="list-disc list-inside mb-4">
        <li><strong>Standard:</strong> 40 minutes</li>
      </ul>

      <h3 className="text-xl font-semibold mb-2">In-store Pickups</h3>
      <p className="mb-2">
        We offer a convenient local pickup option for those who prefer to collect their orders in person.
      </p>
      <p className="mb-2">
        Pickup hours: <strong>Monday to Saturday, 9 AM to 5 PM</strong>.
      </p>
      <p className="mb-6 italic">
        Please wait for the confirmation email before coming to the store to pick up your order.
      </p>

      <h2 className="text-3xl font-semibold mb-4">Delayed Orders</h2>
      <p className="mb-4">
        Unexpected delays can occur due to reasons such as logistic challenges, inclement weather, high demand, or carrier issues. We will promptly notify you with updates and the expected new delivery time.
      </p>
      <p className="mb-6">
        If your order is <strong>significantly delayed</strong>, you will have the choice to continue with the order, modify it, or cancel it for a <strong>full refund</strong>. Our customer service team is always available to assist.
      </p>

      <h2 className="text-3xl font-semibold mb-4">Returns and Exchanges</h2>
      <p className="mb-6">
        If you have any questions about refunds, returns, or exchanges, please review our refund policy.
      </p>

      <h2 className="text-3xl font-semibold mb-4">Contact Information</h2>
      <p className="mb-6">
        If you have any questions or concerns regarding our shipping policy, please contact us: <br />
        <a href="https://kalracaterers.in/contact" className="text-blue-500 underline">https://kalracaterers.in/contact</a>
      </p>

      <p className="text-sm text-gray-500">Last updated on April 8, 2025</p>
    </div>
  );
};

export default ShippingPolicy;