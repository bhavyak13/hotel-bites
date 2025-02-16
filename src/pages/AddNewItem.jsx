import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";

// Reusable input component
const FormInput = ({ label, name, value, onChange, placeholder }) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control type='text'
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

const AddNewItem = () => {
  const firebase = useFirebase();

  // Form state
  const [formData, setFormData] = useState({
    SKU: "",
    name: "",
    description: "",
    productImages: [],
    status: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    // console.log("BK : e: ", e, e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFormData({ ...formData, productImages: Array.from(e.target.files) });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    await firebase.handleCreateNewDoc(formData,"products");
  };

  return (
    <div className="container mt-5">
      <Form onSubmit={handleSubmit}>
        <FormInput
          label="SKU"
          name="SKU"
          value={formData.SKU}
          onChange={handleChange}
          placeholder="Enter SKU"
        />
        <FormInput
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter Product Name"
        />
        <FormInput label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Enter Description" />
        <FileInput label="Product Images" onChange={handleFileChange} />
        <FormInput label="Status" name="status" value={formData.status} onChange={handleChange} placeholder="Enter Status (active/non-active)" />

        <Button variant="primary" type="submit">Create</Button>
      </Form>
    </div>
  );
};

export default AddNewItem;
