import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../../context/Firebase";

import { useNavigate, useParams } from "react-router-dom";

// Reusable input component
const FormInput = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </Form.Group>
);

// Reusable file input component
const FileInput = ({ label, onChange }) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control type="file" multiple onChange={onChange} />
  </Form.Group>
);

const AddNewVariant = () => {
  const firebase = useFirebase();


  const navigate = useNavigate();

  useEffect(() => {
    if (!firebase.isAdmin) { // if not admin 
      navigate("/");
    }
  }, [firebase, navigate]);

  const params = useParams();
  // Form state
  const [formData, setFormData] = useState({
    SKU: "",
    title: "",
    name: "",
    priceOffer: "",
    priceOriginal: "",
    inventoryQuantity: "",
    status: "",
    productImages: [],
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) || "" : value,
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFormData({ ...formData, productImages: Array.from(e.target.files) });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { productId } = params;

    const payload = {
      ...formData,
      productId,
    }

    // // console.log("BK AddNewVariant: payload : ", payload);
    await firebase.handleCreateNewVariant(payload);
    navigate("/");

  };

  return (
    <div className="container mt-5">
      <Form onSubmit={handleSubmit}>
        <FormInput label="SKU" name="SKU" value={formData.SKU} onChange={handleChange} placeholder="Enter SKU" />
        <FormInput label="Title (Weight/Size)" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Weight/Size" />
        <FormInput label="Variant Name (200gm/..)" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Variant Name" />
        <FormInput label="Offer Price" name="priceOffer" value={formData.priceOffer} onChange={handleChange} placeholder="Enter Offer Price" type="number" />
        <FormInput label="Original Price" name="priceOriginal" value={formData.priceOriginal} onChange={handleChange} placeholder="Enter Original Price" type="number" />
        <FormInput label="Inventory Quantity" name="inventoryQuantity" value={formData.inventoryQuantity} onChange={handleChange} placeholder="Enter Inventory Quantity" type="number" />
        <FormInput label="Status" name="status" value={formData.status} onChange={handleChange} placeholder="Enter Status (active/non-active)" />
        {/* <FileInput label="Product Images" onChange={handleFileChange} /> */}

        <Button variant="primary" type="submit">Create</Button>
      </Form>
    </div>
  );
};

export default AddNewVariant;
