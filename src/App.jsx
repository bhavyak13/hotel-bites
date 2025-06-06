import { Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./context/Firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import MyNavbar from "./components/Navbar";
import BookDetailPage from "./pages/Detail";
import Cart from "./pages/Cart";
import FooterBar from "./components/FooterBar";
import { ToastContainer } from "react-toastify";
import AppWrapper from "./AppWrapper";
import DeliveryPartnerOrderScreen from "./pages/DeliveryPartnerOrderScreen";
import OrdersComponent from "./pages/Orders";
import AddNewProduct from "./pages/AddNew/AddNewProduct";
import EditProduct from "./pages/AddNew/EditProduct";
import AddNewVariant from "./pages/AddNew/AddNewVariant";
import EditVariant from "./pages/AddNew/EditVariant";
import ShippingPolicy from "./pages/ShippingDelivery";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsConditions";
import CancellationRefundPolicy from "./pages/CancellationRefund";
import ContactUs from "./pages/Contact-us";
import AddNewAddress from "./pages/AddNew/AddNewAddress";

function App() {
  return (
    <FirebaseProvider>
      <div className="app-container">
        <MyNavbar />
        <ToastContainer />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<AppWrapper><HomePage /></AppWrapper>} />
            <Route path="/contact" element={<AppWrapper><ContactUs /></AppWrapper>} />
            <Route path="/privacy-policy" element={<AppWrapper><PrivacyPolicy /></AppWrapper>} />
            <Route path="/terms-condition" element={<AppWrapper><TermsAndConditions /></AppWrapper>} />
            <Route path="/cancel-refund" element={<AppWrapper><CancellationRefundPolicy /></AppWrapper>} />
            <Route path="/shipping-policy" element={<AppWrapper><ShippingPolicy /></AppWrapper>} />
            <Route path="/login" element={<AppWrapper><LoginPage /></AppWrapper>} />
            <Route path="/products" element={<AppWrapper><HomePage /></AppWrapper>} />
            <Route path="/products/new" element={<AppWrapper status={{ requiresAdmin: true }}><AddNewProduct /></AppWrapper>} />
            <Route path="/products/:productId" element={<AppWrapper status={{}}><BookDetailPage /></AppWrapper>} />
            <Route path="/products/:productId/edit" element={<AppWrapper status={{}}><EditProduct /></AppWrapper>} />
            <Route path="/products/:productId/variants/new" element={<AppWrapper status={{ requiresAdmin: true }}><AddNewVariant /></AppWrapper>} />
            <Route path="/products/:productId/variants/edit" element={<AppWrapper status={{ requiresAdmin: true }}><EditVariant /></AppWrapper>} />
            <Route path="/cart" element={<AppWrapper status={{ requiresLogin: true }}><Cart /></AppWrapper>} />
            <Route path="/orders/delivery-partner" element={<AppWrapper status={{ deliveryScreen: true }}><DeliveryPartnerOrderScreen /></AppWrapper>} />
            <Route path="/orders" element={<AppWrapper status={{ requiresLogin: true }}><OrdersComponent /></AppWrapper>} />
            <Route path="/orders/all" element={<AppWrapper status={{ requiresAdmin: true }}><OrdersComponent isAdminView={true} /></AppWrapper>} />
            <Route path="/address" element={<AppWrapper status={{ requiresAdmin: true }}><AddNewAddress /></AppWrapper>} />
          </Routes>
        </div>
        <FooterBar />
      </div>
    </FirebaseProvider>
  );
}

export default App;