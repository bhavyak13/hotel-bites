import React, { useEffect, useState } from "react";

const Cart = () => {
  const [cart, setCart] = useState({});
  const cartId = localStorage.getItem("cartId");

  const getItemPrice = (itemName) => {
    return {
      "Classic Burger": 5.99,
      "Caesar Salad": 8.99,
      "Margherita Pizza": 14.99,
    }[itemName] || 0;
  };

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    fetch("/api/cart", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cart-Id": cartId,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Error: " + data.error);
        } else {
          setCart(data.cart);
        }
      })
      .catch(() => {
        alert("An error occurred while loading the cart.");
      });
  };

  const clearCart = () => {
    fetch("/api/cart/clear", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cart-Id": cartId,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Error: " + data.error);
        } else {
          alert("Cart is cleared.");
          setCart({});
        }
      })
      .catch(() => {
        alert("An error occurred while clearing cart.");
      });
  };

  return (
    <div>
      <div className="header">
        <div className="ad-container">Advertising Space</div>
        <h1>Order Summary</h1>
        <div id="cartItems">
          {Object.keys(cart).length > 0 ? (
            Object.keys(cart).map((item) => (
              <div key={item}>
                {item} x {cart[item]} = ${" "}
                {(cart[item] * getItemPrice(item)).toFixed(2)}
              </div>
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
          <div>
            Total: ${Object.keys(cart).reduce((acc, item) => acc + cart[item] * getItemPrice(item), 0).toFixed(2)}
          </div>
        </div>
        <button onClick={() => (window.location.href = "/order-status")}>
          Place Order
        </button>
        <button onClick={clearCart}>Clear Cart</button>
      </div>
      <nav className="bottom-nav">
        <a href="/" className="nav-item">
          <span>Home</span>
        </a>
        <a href="/menu" className="nav-item">
          <span>Menu</span>
        </a>
        <a href="/order-status" className="nav-item active">
          <span>Orders</span>
        </a>
      </nav>
    </div>
  );
};

export default Cart;
