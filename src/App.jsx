import { Routes, Route } from "react-router-dom";

// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import MyNavbar from "./components/Navbar";
import BookDetailPage from "./pages/Detail";
import AddNewVariant from "./pages/AddNewVariant";
import AddNewProduct from "./pages/AddNewProduct";
import Cart from "./pages/Cart";


import { ToastContainer, toast } from 'react-toastify';
import PaymentPage from "./pages/Payment";
function App() {

  return (
    <div>
      <MyNavbar />

      <ToastContainer />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<HomePage />} />
        <Route path="/products/new" element={<AddNewProduct />} />
        <Route path="/products/:productId" element={<BookDetailPage />} />
        <Route path="/products/:productId/variants/new" element={<AddNewVariant />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<PaymentPage />} />
        {/* <Route path="variants/new" element={<AddNewVariant />} /> */}
        {/* <Route path="/book/list" element={<ListingPage />} />
        <Route path="/book/view/:bookId" element={<BookDetailPage />} />
        <Route path="/book/orders" element={<OrdersPage />} />
        <Route path="/books/orders/:bookId" element={<ViewOrderDetails />} /> */}
      </Routes>
    </div>
  );
}

export default App;
