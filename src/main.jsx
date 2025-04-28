import {createRoot} from 'react-dom/client'
import {BrowserRouter, Route, Routes, Navigate} from "react-router"
import './index.css'
import App from './App.jsx'
import Shop from "./pages/Shop.jsx"
import Login from "./pages/Login.jsx"
import Layout from "./pages/Layout.jsx"
import Register from "./pages/Register.jsx"
import ForgotPassword from "./pages/ForgotPassword.jsx"
import Cart from "./pages/Cart.jsx"
import Orders from "./pages/Orders.jsx"
import Order from "./pages/Order.jsx"
import Checkout from "./pages/Checkout.jsx"
import Product from "./pages/Product.jsx"
import Admin from "./pages/Admin.jsx"
import {ProtectedRoute, PublicOnlyRoute} from "./components/AuthRoutes.jsx"
import {CartProvider} from "./context/CartContext.jsx"
import Profile from "./pages/Profile.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Contact from "./pages/contact.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CartProvider>
      <Routes>
        <Route element={<Layout/>}>
          <Route index path="/" element={<App/>}/>
        </Route>

        <Route element={<PublicOnlyRoute/>}>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
        </Route>

        <Route element={<ProtectedRoute/>}>
          <Route element={<Layout/>}>
            <Route path="/shop" element={<Shop/>}/>
            <Route path="/cart" element={<Cart/>}/>
            <Route path="/checkout" element={<Checkout/>}/>
            <Route path="/product/:id" element={<Product/>}/>
            <Route path="/orders" element={<Orders/>}/> {/* Add the Orders route */}
            <Route path="/order/:id" element={<Order/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/contact" element={<Contact/>}/>

            <Route element={<AdminRoute/>}>
              <Route path="/admin" element={<Admin/>}/>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </CartProvider>
  </BrowserRouter>
)