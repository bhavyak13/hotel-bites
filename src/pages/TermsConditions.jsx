import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      
      <p className="mb-6">
        Welcome to [Your Company Name]! These Terms and Conditions outline the rules and regulations for using our website, app, and services.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Contact Information</h2>
      <p className="mb-6">
        If you have any questions about these Terms, please contact us at:
        <br />
        <strong>Email:</strong> kalracaterer4522@gmail.com
        <br />
        <strong>Phone:</strong> [+91 7011974522, +91 9311764250 ]
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. Effective Date</h2>
      <p className="mb-6">
        These Terms and Conditions are effective as of <strong>[Effective Date]</strong> and will remain in effect unless modified or terminated by [Your Company Name].
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Limitation of Liability and Disclaimer of Warranties</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Our food delivery services are provided "as is" without any warranties, express or implied.</li>
        <li>[Your Company Name] is not liable for any damages resulting from the use or inability to use the service, including delivery delays, incorrect orders, or technical issues.</li>
        <li>We do not guarantee the accuracy or reliability of third-party vendors or delivery partners.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Rules of Conduct</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Provide accurate and complete information during registration and ordering.</li>
        <li>Respect the rights of other users, delivery staff, and restaurant partners.</li>
        <li>Not engage in fraudulent activities, misuse the service, or violate any applicable laws.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. User Restrictions</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>Using our platform for any illegal purposes.</li>
        <li>Attempting to access or interfere with our systems or databases without authorization.</li>
        <li>Copying, distributing, or modifying content from our website/app without permission.</li>
      </ul>
    </div>
  );
};

export default TermsAndConditions;
