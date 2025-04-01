import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import { useFirebase } from "../context/Firebase";
import { Card, Button, Form } from "react-bootstrap";

const EditVariants = () => {
  const { id: productId } = useParams();
  const firebase = useFirebase();
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const fetchedVariants = await firebase.fetchVariants(productId);
        setVariants(fetchedVariants);
      } catch (error) {
        console.error("Error fetching variants:", error);
      }
    };

    fetchVariants();
  }, [productId, firebase]);

  const handleVariantUpdate = async (variantId, updatedVariant) => {
    try {
      await firebase.updateVariant(productId, variantId, updatedVariant);
      // Refresh variants after update
      const fetchedVariants = await firebase.fetchVariants(productId);
      setVariants(fetchedVariants);
    } catch (error) {
      console.error("Error updating variant:", error);
    }
  };

  const handlePriceChange = (variantId, field, value) => {
    setVariants(variants.map(variant =>
      variant.id === variantId ? { ...variant, [field]: value } : variant
    ));
  };

  const handleUpdateClick = (variantId, variant) => {
    handleVariantUpdate(variantId, variant);
  };

  return (
    <div className="container mt-5">
      <h2>Edit Variants</h2>
      {variants.map((variant) => (
        <Card key={variant.id} className="mb-3">
          <Card.Body>
            <Form>
              <Form.Group>
                <Form.Label>Price Original</Form.Label>
                <Form.Control
                  type="number"
                  value={variant.priceOriginal}
                  onChange={(e) => handlePriceChange(variant.id, "priceOriginal", e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Price Offer</Form.Label>
                <Form.Control
                  type="number"
                  value={variant.priceOffer}
                  onChange={(e) => handlePriceChange(variant.id, "priceOffer", e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={() => handleUpdateClick(variant.id, variant)}>
                Update
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default EditVariants;