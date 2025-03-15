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
import FooterBar from "./components/FooterBar";


import { ToastContainer, toast } from 'react-toastify';
import PaymentPage from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import AllOrders from "./pages/AllOrders";
import AppWrapper from "./AppWrapper";
import DeliveryPartnerOrderScreen from "./pages/DeliveryPartnerOrderScreen";

function App() {
    return (
        <div>
            <MyNavbar />
            <ToastContainer />

            <Routes>
                <Route path="/" element={<AppWrapper><HomePage /></AppWrapper>} />
                <Route path="/login" element={<AppWrapper><LoginPage /></AppWrapper>} />
                <Route path="/register" element={<AppWrapper><RegisterPage /></AppWrapper>} />

                {/* Requires Login */}
                <Route
                    path="/products"
                    element={<AppWrapper ><HomePage /></AppWrapper>}
                />
                <Route
                    path="/products/new"
                    element={<AppWrapper status={{ requiresAdmin: true }}><AddNewProduct /></AppWrapper>}
                />
                <Route
                    path="/products/:productId"
                    element={<AppWrapper status={{}}><BookDetailPage /></AppWrapper>}
                />
                <Route
                    path="/products/:productId/variants/new"
                    element={<AppWrapper status={{ requiresAdmin: true }}><AddNewVariant /></AppWrapper>}
                />
                <Route
                    path="/cart"
                    element={<AppWrapper status={{ requiresLogin: true }}><Cart /></AppWrapper>}
                />
                {/* <Route
                  path="/payment"
                  element={<AppWrapper status={{ requiresLogin: true }}><PaymentPage /></AppWrapper>}
              /> */}
                <Route
                    path="/orders/delivery-partner"
                    element={<AppWrapper status={{ deliveryScreen: true }}><DeliveryPartnerOrderScreen /></AppWrapper>}
                />
                <Route
                    path="/orders"
                    element={<AppWrapper status={{ requiresLogin: true }}><MyOrders /></AppWrapper>}
                />

                {/* Requires Admin */}
                <Route
                    path="/orders/all"
                    element={<AppWrapper status={{ requiresAdmin: true }}><AllOrders /></AppWrapper>}
                />
            </Routes>
            <FooterBar />
        </div>
    );
}

export default App;
