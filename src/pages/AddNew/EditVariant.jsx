import React, { useEffect, useState, useCallback } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
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

const EditVariants = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const { productId } = useParams(); // Get productId from URL

  // State to hold all variants
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingVariantIndex, setUpdatingVariantIndex] = useState(null); // Track which variant is being updated

  // Fetch all variants for the product using the existing function
  const fetchVariants = useCallback(async () => {
    if (!productId) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Use the existing function to fetch all variants
      const querySnapshot = await firebase.getSubCollectionAllDocuments(
        "products",
        productId,
        "variants"
      );

      const fetchedVariants = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (fetchedVariants.length > 0) {
        setVariants(fetchedVariants);
      } else {
        setError("No variants found for this product.");
      }
    } catch (err) {
      console.error("Error fetching variants:", err);
      setError(`Error fetching variants: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [firebase, productId]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  // Handle input changes for a specific variant
  const handleVariantChange = (index, e) => {
    const { name, value, type } = e.target;
    setVariants((prevVariants) =>
      prevVariants.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [name]: type === "number" ? parseFloat(value) || "" : value,
            }
          : variant
      )
    );
  };

  // Handle file selection for a specific variant
  const handleFileChange = (index, e) => {
    const files = Array.from(e.target.files);
    setVariants((prevVariants) =>
      prevVariants.map((variant, i) =>
        i === index ? { ...variant, newImageFiles: files } : variant
      )
    );
  };

  // Submit a single variant
  const handleUpdateVariant = async (index) => {
    setUpdatingVariantIndex(index); // Set the index of the variant being updated
    setError(null);

    try {
      const variant = variants[index];
      const { id, newImageFiles, ...dataToUpdate } = variant;

      // Handle image uploads if new files are selected
      if (newImageFiles && newImageFiles.length > 0) {
        dataToUpdate.productImages = newImageFiles; // Pass new files to updateVariant
      }

      // Update the variant
      await firebase.updateVariant(productId, id, dataToUpdate);

      firebase.displayToastMessage(`Variant ${index + 1} updated successfully!`, "success");
    } catch (err) {
      console.error(`Error updating variant ${index + 1}:`, err);
      setError(`Error updating variant ${index + 1}: ${err.message}`);
      firebase.displayToastMessage(`Error updating variant ${index + 1}: ${err.message}`, "error");
    } finally {
      setUpdatingVariantIndex(null); // Reset the updating index
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading Variants...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Edit Variants (Product ID: {productId})</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {variants.length === 0 ? (
        <Alert variant="warning">No variants found for this product.</Alert>
      ) : (
        <Form>
          {variants.map((variant, index) => (
            <div key={variant.id} className="mb-4 p-3 border rounded">
              <h5 className="mb-3">Variant {index + 1}</h5>
              <FormInput
                label="SKU"
                name="SKU"
                value={variant.SKU}
                onChange={(e) => handleVariantChange(index, e)}
                placeholder="Enter SKU"
              />
              <FormInput
                label="Title (e.g., Weight/Size Attribute)"
                name="title"
                value={variant.title}
                onChange={(e) => handleVariantChange(index, e)}
                placeholder="Enter Title (e.g., 500g, Large)"
              />
              <FormInput
                label="Variant Name (e.g., Specific Color/Flavor)"
                name="name"
                value={variant.name}
                onChange={(e) => handleVariantChange(index, e)}
                placeholder="Enter Variant Name (e.g., Red, Vanilla)"
              />
              <FormInput
                label="Offer Price"
                name="priceOffer"
                value={variant.priceOffer}
                onChange={(e) => handleVariantChange(index, e)}
                placeholder="Enter Offer Price"
                type="number"
              />
              <FormInput
                label="Original Price"
                name="priceOriginal"
                value={variant.priceOriginal}
                onChange={(e) => handleVariantChange(index, e)}
                placeholder="Enter Original Price"
                type="number"
              />
              <FormInput
                label="Inventory Quantity"
                name="inventoryQuantity"
                value={variant.inventoryQuantity}
                onChange={(e) => handleVariantChange(index, e)}
                placeholder="Enter Inventory Quantity"
                type="number"
              />
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={variant.status}
                  onChange={(e) => handleVariantChange(index, e)}
                >
                  <option value="active">Active</option>
                  <option value="non-active">Non-Active</option>
                </Form.Select>
              </Form.Group>
              {/* <Form.Group className="mb-3"> */}
                {/* <Form.Label>Existing Images</Form.Label>
                <div>
                  {variant.productImages && variant.productImages.length > 0 ? (
                    variant.productImages.map((path, i) => (
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
              <Form.Group className="mb-3">
                <Form.Label>Upload New/Replacement Images</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(index, e)}
                />
                {variant.newImageFiles && variant.newImageFiles.length > 0 && (
                  <div className="mt-2">
                    <small>
                      Selected files:{" "}
                      {variant.newImageFiles.map((f) => f.name).join(", ")}
                    </small>
                  </div>
                )}
              </Form.Group> */}
              <Button
                variant="primary"
                onClick={() => handleUpdateVariant(index)}
                disabled={updatingVariantIndex === index}
              >
                {updatingVariantIndex === index ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  "Update Variant"
                )}
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            className="ms-2"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
        </Form>
      )}
    </div>
  );
};

export default EditVariants;