import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <p className="mb-6">
        At [Kalra Catters], we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and protect the data you provide to us.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Name</li>
        <li>Contact details (email address, phone number, delivery address)</li>
        <li>Payment information (processed securely via third-party payment providers)</li>
        <li>Order history and preferences</li>
        <li>Device and browser information</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Collect Information</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Account registration forms</li>
        <li>Order placement and checkout forms</li>
        <li>Customer support inquiries</li>
        <li>Cookies and similar technologies when you browse our website or app</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use the Collected Information</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Process and deliver your orders efficiently</li>
        <li>Personalize your user experience</li>
        <li>Communicate updates, offers, and order status</li>
        <li>Improve our services and customer support</li>
        <li>Ensure compliance with legal obligations</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. How We Keep Information Safe</h2>
      <p className="mb-6">
        We implement a variety of security measures to maintain the safety of your personal information:
      </p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Secure servers and databases</li>
        <li>Encryption of sensitive data</li>
        <li>Access controls and authentication measures</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Sharing Information with Third Parties</h2>
      <p className="mb-6">
        We do not sell or trade your personal information.
        <br />
        We may share limited necessary information with trusted third-party service providers such as:
      </p>
      <ul className="list-disc list-inside space-y-2">
        <li>Payment processors</li>
        <li>Delivery partners</li>
        <li>Customer service tools</li>
      </ul>
      <p className="mt-4">
        All third parties are required to keep your information confidential and use it only to provide the contracted services.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
