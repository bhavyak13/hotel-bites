import React, { useEffect, useState, useRef } from "react";
import { useFirebase } from "../context/Firebase";
import { Card, ListGroup, Alert, Spinner, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import OrderFoodCard from "../components/OrderFoodCard";
import "../pages/orders.css";

const ORDER_STATUSES = [
  "Created",
  // "Processing",
  "Preparing",
  // "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const OrdersComponent = ({ isAdminView }) => {
  const firebase = useFirebase();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // State for filtered orders
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const printRef = useRef(null);

  useEffect(() => {
    if (isAdminView && !firebase?.isAdmin) {
      navigate("/");
    }
  }, [firebase, isAdminView, navigate]);

  const getOrders = async () => {
    try {
      const fetchedOrders = isAdminView
        ? await firebase.fetchAllOrders()
        : await firebase.fetchOrders();

      const ordersWithDetails = await Promise.all(
        fetchedOrders.map(async (order) => {
          const updatedPurchasedItems = await firebase.fetchPurchasedItemWithDetails(order.purchasedItems);
          return { ...order, purchasedItems: updatedPurchasedItems };
        })
      );

      const sortedOrders = ordersWithDetails.sort((a, b) => new Date(b._createdDate) - new Date(a._createdDate));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  
    // Listen for new orders
    const unsubscribe = firebase.listenForNewOrders((newOrders) => {
      if (newOrders.length > 0) {
        // Play notification sound and display toast message for specific roles
        if (!(firebase?.user && !firebase?.isAdmin && !firebase?.isDeliveryPartner)) {
          firebase.playNotificationSound(); // Play the notification sound
          firebase.displayToastMessage("New order received!");
        }
  
        // Add new orders to the list
        setOrders((prevOrders) => [...newOrders, ...prevOrders]);
      }
    });
  
    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [firebase]);

  useEffect(() => {
    setFilteredOrders(orders); // Sync filtered orders with all orders
  }, [orders]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = orders.filter((order) =>
      order.orderId.toLowerCase().includes(query) ||
      order.phoneNumber?.toLowerCase().includes(query) ||
      order.address?.toLowerCase().includes(query)
    );

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setLoading(true);
    await firebase.updateOrderStatus(orderId, { status: newStatus });
    await getOrders();
    setLoading(false);
  };

  const formattedDate = (_createdDate) => {
    return _createdDate ? new Date(_createdDate).toLocaleString('en-GB', {
      year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) : "";
  };

  // Function to generate the HTML content for the print bill
  const generatePrintContentHtml = (order) => {
    // Correctly calculate totalItemsPrice using variant's price
    const totalItemsPrice = order.purchasedItems?.reduce((sum, item) => {
      const price = parseFloat(item.variant?.priceOffer || item.variant?.priceOriginal || 0);
      return sum + (item.quantity * price);
    }, 0) || 0;

    const deliveryFee = 10; // Added delivery fee
    const totalWithDelivery = totalItemsPrice + deliveryFee; // Calculate total with delivery
    const shopName = "KALRA CATERS"; // Corrected typo, ensure this is your desired name
    const shopAddress = "M.B.B.S. GIRLS MESS , SJH NEW DELHI - 110029"; // Replace with actual shop address
    const shopPhone = "PH: +91 7011974522 , +91 9311764250"; // Replace with actual shop phone or order-related contact

    // Use a fixed width for the bill, suitable for 80mm printer
    // Adjusted font size for better fit on POS printers
    const billContent = `
      <div style="width: 78mm; padding: 5px; box-sizing: border-box; font-family: 'monospace', 'Courier New', monospace; font-size: 10px; line-height: 1.2; font-weight: bold;">
        <div style="text-align: center; margin-bottom: 10px;">
          <h2 style="font-size: 14px; margin: 0; padding: 0; text-transform: uppercase;">${shopName}</h2>
          <p style="margin: 2px 0; font-size: 9px;">${shopAddress}</p>
          <p style="margin: 2px 0; font-size: 9px;">${shopPhone}</p>
        </div>
        <hr style="border-top: 1px dashed black; margin: 5px 0;" />
        <div style="margin-bottom: 5px;">
          <p style="margin: 2px 0;">Order ID: ${order.orderId}</p>
          <p style="margin: 2px 0;">Date: ${formattedDate(order._createdDate)}</p>
          <p style="margin: 2px 0;">Status: ${order.status}</p>
        </div>
        <hr style="border-top: 1px dashed black; margin: 5px 0;" />
        <div style="margin-bottom: 5px;">
          <p style="margin: 2px 0;">Address:</p>
          <p style="margin: 2px 0;">${order?.landmark ? order.landmark + ", " : ""}${order?.address}</p>
          <p style="margin: 2px 0;">Phone: ${order?.phoneNumber || "N/A"}</p>
          ${order.cookingInstructions ? `<p style="margin: 2px 0; color: #555;">Instructions: ${order.cookingInstructions}</p>` : ''}
        </div>
        <hr style="border-top: 1px dashed black; margin: 5px 0;" />
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed black; padding-bottom: 1mm; margin-bottom: 1mm;">
          <span style="flex-grow: 1; flex-basis: 35%; padding-right: 1mm; word-break: break-word;">ITEM</span>
          <span style="flex-basis: 20%; text-align: center;">VARIANT</span>
          <span style="flex-basis: 10%; text-align: center;">QTY</span>
          <span style="flex-basis: 15%; text-align: right;">PRICE</span>
          <span style="flex-basis: 20%; text-align: right;">AMOUNT</span>
        </div>
        ${order.purchasedItems?.map((item) => {
          const productName = item.product?.name || 'Unknown Product';
          const variantName = item.variant?.name || '';
          const pricePerUnit = parseFloat(item.variant?.priceOffer || item.variant?.priceOriginal || 0);
          const priceDisplay = pricePerUnit ? `₹${pricePerUnit.toFixed(2)}` : 'N/A';
          const lineTotal = (item.quantity || 0) * pricePerUnit;
          return `
          <div style="display: flex; justify-content: space-between; margin-bottom: 1mm;">
            <span style="flex-grow: 1; flex-basis: 35%; word-break: break-word; padding-right: 1mm;">${productName}</span>
            <span style="flex-basis: 20%; text-align: center;">${variantName}</span>
            <span style="flex-basis: 10%; text-align: center;">${item.quantity || 0}</span>
            <span style="flex-basis: 15%; text-align: right;">${priceDisplay}</span>
            <span style="flex-basis: 20%; text-align: right;">₹${lineTotal.toFixed(2)}</span>
          </div>
        `;
        }).join('')}
        <hr style="border-top: 1px dashed black; margin: 5px 0;" />
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>SUB TOTAL:</span>
          <span>₹${totalItemsPrice.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Delivery Fee:</span>
          <span>₹${deliveryFee.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2mm;">
          <span>TOTAL BILL:</span>
          <span>₹${totalWithDelivery.toFixed(2)}</span>
        </div>
        <hr style="border-top: 1px dashed black; margin: 5px 0;" />
        <div style="text-align: center; font-size: 11px; margin-top: 2mm;">
          THANK YOU, VISIT AGAIN!
        </div>
      </div>
    `;
    return billContent;
  };

  const handlePrint = (order) => {
    const printWindow = window.open("", "_blank", "width=300,height=600"); // Adjust window size if necessary
    const printContentHtml = generatePrintContentHtml(order);

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Print</title>
          <style>
            @page {
              size: 80mm 210mm; /* A specific size for 80C format */
              margin: 0;
            }
            body {
              font-family: 'monospace', 'Courier New', monospace !important;
              font-size: 8pt !important; /* Adjusted for POS, can be 8pt, 9pt, or 10pt */
              font-weight: bold !important; /* Make all text bold */
              margin: 0;
              padding: 0;
              color: #000;
              background-color: #fff;
            }
            /* Ensure all elements within the bill respect the print styles, !important might be needed for overrides */
            h1, h2, h3, h4, h5, h6, p, span, div, table, th, td { /* Apply to all common text elements */
              color: #000 !important; 
            }
            strong {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${printContentHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close(); // Close window after print
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <Alert variant="warning" className="mt-5 text-center">
        No orders found.
      </Alert>
    );
  }

  return (
    <div className="container mt-5">
      <h3 className="mb-4">{isAdminView ? "All Orders" : "My Orders"}</h3>

            {/* Search Bar */}
      <div className="search-container mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search orders by ID, phone number, or address..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {filteredOrders?.map((order) => (
        <Card key={order.orderId} className="order-card">
          <div className="order-card-header">
            Order ID: {order.orderId}
          </div>
          <div className="order-card-body" id={`order-${order.orderId}`}> {/* Removed ref from here as it's no longer used for printing directly */}
            <h6 className="order-details">
              Status:
              {firebase?.isAdmin ? (
                <Form.Select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="ms-2 d-inline w-auto"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              ) : (
                <span className="text-primary ms-2">{order.status}</span>
              )}
            </h6>
            <h6 className="order-details">Phone Number: {order?.phoneNumber || "N/A"}</h6>
            <h6 className="order-details">Final Price: ₹{order.finalPrice}</h6>
            {order.cookingInstructions && (
              <h6 className="order-details">
                <strong>Cooking Instructions:</strong>
                <span style={{ color: "red" }}> {order.cookingInstructions}</span>
              </h6>
            )}
            <h6 className="order-details">
              <strong>
                Address:
                {order?.landmark && (
                  <span style={{ fontStyle: "italic", color: "green" }}>
                    {" "}{order.landmark} ,
                  </span>
                )}
                {order?.address}
              </strong>
            </h6>
            {isAdminView && <h6 className="order-details">Delivery Partner ID: {order?.deliveryPartnerId}</h6>}
            {order?._createdDate && <h6 className="order-details">Created Date: {formattedDate(order?._createdDate)}</h6>}
            {order?.paymentMethod && <h6 className="order-details">Payment Method: {order?.paymentMethod}</h6>}
            {order?.razorpayPaymentStatus &&
              <h6 className="order-details">Payment Status: {order?.razorpayPaymentStatus === 'Done' ? "Paid" : 'Pending'}</h6>
            }
            <hr />
            <div className="order-section-title">Purchased Items:</div>
            <ListGroup className="order-items-list">
              {order.purchasedItems?.map((item, idx) => (
                <ListGroup.Item key={idx} className="order-item">
                  {item ? (
                    <OrderFoodCard
                      key={item.id}
                      id={item.id}
                      {...item}
                      finalPrice={order?.finalPrice}
                    />
                  ) : (
                    <p>Item details are missing.</p>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <hr />
            <div className="order-total-section">
              Delivery Fee: ₹10 <br />
              Total Bill: ₹{order.finalPrice + 10}
            </div>
          </div>
          {firebase?.isAdmin && (
            <div className="order-card-footer">
              <Button variant="secondary" onClick={() => handlePrint(order)} ref={printRef}>
                Print Order
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default OrdersComponent;