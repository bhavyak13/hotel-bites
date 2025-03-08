import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate, useParams } from "react-router-dom";
import { useFirebase } from "../context/Firebase";
import { Alert, Spinner } from "react-bootstrap";

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
  const navigate = useNavigate();

  const params = useParams();
  const firebase = useFirebase();

  const [qty, setQty] = useState(1);
  const [productData, setProductData] = useState(null);
  const [variantsData, setVariantsData] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [url, setURL] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      if(!loading)setLoading(true);
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
      setLoading(false);
    };
    fetchData();
  }, [params.productId, firebase]);

  const handleVariantChange = (e) => {
    const selectedId = e.target.value;
    const variant = variantsData.find((v) => v.id === selectedId);
    setSelectedVariant({ id: variant.id, ...variant.data() });
  };





  const addToCart = async () => {
    if (!selectedVariant) return alert("Please select a variant");

    const isItemAlreadyInCart = await firebase.checkIsItemAlreadyInCart('shoppingCartItems', params.productId, selectedVariant.id);
    console.log("BK isItemAlreadyInCart", isItemAlreadyInCart);

    if (isItemAlreadyInCart === null) {
      // Item does not exist, add new entry
      const payload = {
        quantity: qty,
        productId: params.productId,
        variantId: selectedVariant.id,
      };
      await firebase.handleCreateNewDoc(payload, "shoppingCartItems");
      firebase.displayToastMessage("Added to cart successfully!");
    } else {
      firebase.displayToastMessage("Item already in cart!");
    }
    navigate('/');
  };


  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>loading detials..</p>
      </div>
    );
  }

  if (!productData || !variantsData || !selectedVariant)
    return (
      <div className="container mt-5">
        <Alert key={"info"} variant={"info"}>
          No data found
        </Alert>
      </div>
    )

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

      <Button
        onClick={addToCart}
        variant="primary"
        disabled={!firebase?.user}
      >
        Add to Cart
      </Button>
      <div className="not-logged-in-text">
        {!firebase?.user && "Please Login to start adding items to cart"}
      </div>
    </div>
  );
};

export default BookDetailPage;
