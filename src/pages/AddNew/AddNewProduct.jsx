import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";

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
    <Form.Control type="file"
      //  multiple
      onChange={onChange} />
  </Form.Group>
);

const AddNewProduct = () => {
  const firebase = useFirebase();


  const navigate = useNavigate();

  useEffect(() => {
    if (!firebase.isAdmin) { // if not admin 
      navigate("/");
    }
  }, [firebase, navigate]);

  // Form state
  const [coverPic, setCoverPic] = useState("");

  const defaultFormData = {
    SKU: "",
    name: "",
    description: "",
    productImage: "",
    status: "",
  }
  const [formData, setFormData] = useState(defaultFormData);

  // Handle input changes
  const handleChange = (e) => {
    // // // console.log("BK : e: ", e, e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFormData({ ...formData, productImage: Array.from(e.target.files?.[0]) });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      productImage: coverPic,
    };

    // // // console.log("BK finaldata",finalData,coverPic);

    await firebase.handleCreateNewDoc(
      finalData,
      "products"
    );
    setFormData(defaultFormData);
    firebase.displayToastMessage("product created successfully!");
    navigate('/');
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
        {/* <FileInput label="Product Images" onChange={handleFileChange} /> */}
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Cover Pic</Form.Label>
          <Form.Control
            onChange={(e) => setCoverPic(e.target.files[0])}
            type="file"
          />
        </Form.Group>
        <FormInput label="Status" name="status" value={formData.status} onChange={handleChange} placeholder="Enter Status (active/non-active)" />

        <Button variant="primary" type="submit">Create</Button>
      </Form>
    </div>
  );
};

export default AddNewProduct;
