import React from 'react';

const CancellationRefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cancellation and Refund Policy</h1>
      
      <p className="mb-6">
        At [Kalra Catters], we strive to provide a smooth food ordering experience. However, if you are not satisfied with your order, here’s our policy on cancellations and refunds:
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Return or Exchange Period</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Orders can be canceled <strong>within 15 minutes</strong> of placing the order, provided that food preparation has not yet started.</li>
        <li>Once food preparation has begun, cancellations or exchanges are no longer possible due to the perishable nature of our products.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. How to Initiate a Return or Exchange</h2>
      <p className="mb-6">
        To request a cancellation or refund, please contact our support team immediately:
        <br />
        <strong>Email:</strong> kalracaterer4522@gmail.com
        <br />
        <strong>Phone:</strong> [+91 7011974522, +91 9311764250 ]
        <br />
        Provide your <strong>order ID</strong>, <strong>reason for cancellation</strong>, and <strong>preferred resolution</strong> (refund, replacement, or credit).
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Refund Processing Time</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>Approved refunds will be processed within <strong>7-10 business days</strong> after cancellation approval.</li>
        <li>Refunds will be credited to the original payment method used at the time of ordering.</li>
        <li>For cash-on-delivery orders, refunds will be processed through bank transfer after confirmation.</li>
      </ul>
    </div>
  );
};

export default CancellationRefundPolicy;