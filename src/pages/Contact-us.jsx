import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    // You can integrate API/email service here later
    alert('Thank you for reaching out! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <div className="mb-8">
        <p><strong>Email Address:</strong> kalracaterer4522@gmail.com</p>
        <p><strong>Mobile Number:</strong> +91 9311764250, +91 9990708731</p>
        <p><strong>Operating Address:</strong> Girls Hostel Mess, Safadarjung Hospital , Anasri Nagar , New Delhi -110029</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Name</label>
          <input 
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Email</label>
          <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Phone Number</label>
          <input 
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Message</label>
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full border rounded p-2 h-32"
          />
        </div>

        <button 
          type="submit"
          className="primary-color"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
