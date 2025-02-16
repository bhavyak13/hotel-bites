import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useParams } from "react-router-dom";
import { useFirebase } from "../context/Firebase";

// Reusable Select Component
const SelectInput = ({ label, options, selected, onChange }) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Select value={selected?.id || ""} onChange={onChange}>
      {options.length === 0 ? (
        <option disabled>No variants available</option>
      ) : (
        options.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.data().title} - {variant.data().name} (₹{variant.data().priceOffer || variant.data().priceOriginal})
          </option>
        ))
      )}
    </Form.Select>
  </Form.Group>
);

const BookDetailPage = () => {
  const params = useParams();
  const firebase = useFirebase();

  const [qty, setQty] = useState(1);
  const [productData, setProductData] = useState(null);
  const [variantsData, setVariantsData] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [url, setURL] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const collectionName = "products";
      const variantsCollection = "variants";

      // Fetch product details
      const res = await firebase.getDocById(params.productId, collectionName);
      setProductData(res.data());

      // Fetch product variants
      const res2 = await firebase.getSubCollectionAllDocuments(collectionName, params.productId, variantsCollection);
      setVariantsData(res2.docs);

      // Set the first variant as selected by default
      if (res2.docs.length > 0) setSelectedVariant({ id: res2.docs[0].id, ...res2.docs[0].data() });
    };
    fetchData();
  }, [params.productId, firebase]);

  const handleVariantChange = (e) => {
    const selectedId = e.target.value;
    const variant = variantsData.find((v) => v.id === selectedId);
    setSelectedVariant({ id: variant.id, ...variant.data() });
  };

  const addToCart = () => {
    if (!selectedVariant) return alert("Please select a variant");

    const payload = {
      quantity: qty,
      productId: params.productId,
      variantId: selectedVariant.id,
    };

    firebase.handleCreateNewDoc(payload, "shoppingCartItems");
  };

  if (!productData || !variantsData || !selectedVariant) return <h1>Loading... / No data</h1>;

  return (
    <div className="container mt-5">
      <h1>{productData.name}</h1>
      <img src={url} width="50%" style={{ borderRadius: "10px" }} alt="Product" />

      <h1>Details</h1>
      {/* {selectedVariant.id} */}
      <p>Price: Rs. {selectedVariant?.priceOffer || selectedVariant?.priceOriginal || "N/A"}</p>

      {/* Variant Selector */}
      <SelectInput
        label="Select Variant"
        options={variantsData}
        selected={selectedVariant}
        onChange={handleVariantChange}
      />

      {/* Quantity Input */}
      <Form.Group className="mb-3">
        <Form.Label>Quantity</Form.Label>
        <Form.Control
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
      </Form.Group>

      <Button onClick={addToCart} variant="primary">
        Add to Cart
      </Button>
    </div>
  );
};

export default BookDetailPage;
