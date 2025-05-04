import React, { useEffect, useState, useCallback } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { useFirebase } from "../../context/Firebase";
import { useNavigate, useParams } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

const EditProduct = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const { productId } = useParams(); // Get productId from URL

  // State to hold product details
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product details
  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const productDoc = await firebase.fetchProductById(productId);
      if (productDoc) {
        setProduct(productDoc);
      } else {
        setError("Product not found.");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(`Error fetching product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [firebase, productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Handle input changes for the product
  const handleProductChange = (e) => {
    const { name, value, type } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: type === "number" ? parseFloat(value) || "" : value,
    }));
  };

  // Handle file selection for product images
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prevProduct) => ({
      ...prevProduct,
      newImageFiles: files,
    }));
  };

  // Submit product updates
  const handleUpdateProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const { id, newImageFiles, ...dataToUpdate } = product;

      // Handle image uploads if new files are selected
      if (newImageFiles && newImageFiles.length > 0) {
        const uploadedImageUrls = await Promise.all(
          newImageFiles.map(async (file) => {
            const storageRef = ref(firebase.storage, `products/${productId}/${file.name}`);
            await uploadBytes(storageRef, file); // Upload the file to Firebase Storage
            return await getDownloadURL(storageRef); // Get the download URL
          })
        );

        // Append the new image URLs to the existing productImage array
        dataToUpdate.productImage = Array.isArray(product.productImage)
          ? [...product.productImage, ...uploadedImageUrls]
          : uploadedImageUrls;
      }

      // Update the product in Firestore
      await firebase.updateProduct(productId, dataToUpdate);

      firebase.displayToastMessage("Product updated successfully!", "success");
      navigate(`/products/${productId}`); // Redirect to product details or list
    } catch (err) {
      console.error("Error updating product:", err);
      setError(`Error updating product: ${err.message}`);
      firebase.displayToastMessage(`Error updating product: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading Product...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Edit Product (Product ID: {productId})</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {product && (
        <div className="mb-5 p-3 border rounded">
          <h4>Product Details</h4>
          <FormInput
            label="Product Name"
            name="name"
            value={product.name}
            onChange={handleProductChange}
            placeholder="Enter Product Name"
          />
          <FormInput
            label="Description"
            name="description"
            value={product.description}
            onChange={handleProductChange}
            placeholder="Enter Product Description"
          />
          <FormInput
            label="Category"
            name="category"
            value={product.category}
            onChange={handleProductChange}
            placeholder="Enter Product Category"
          />
          <FormInput
            label="Price"
            name="price"
            value={product.price}
            onChange={handleProductChange}
            placeholder="Enter Product Price"
            type="number"
          />
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={product.status}
              onChange={handleProductChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Existing Images</Form.Label>
            <div>
              {Array.isArray(product.productImage) && product.productImage.length > 0 ? (
                product.productImage.map((path, i) => (
                  <span key={i} className="me-2 badge bg-secondary">
                    {path.split("/").pop()}
                  </span>
                ))
              ) : (
                <p>
                  <small>No existing images.</small>
                </p>
              )}
            </div>
          </Form.Group>
          <FileInput label="Upload New/Replacement Images" onChange={handleFileChange} />
          {product.newImageFiles && product.newImageFiles.length > 0 && (
            <div className="mt-2">
              <small>
                Selected files: {product.newImageFiles.map((f) => f.name).join(", ")}
              </small>
            </div>
          )}
          <Button variant="primary" onClick={handleUpdateProduct} disabled={loading}>
            {loading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Update Product"
            )}
          </Button>
          <Button
            variant="secondary"
            className="ms-2"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditProduct;