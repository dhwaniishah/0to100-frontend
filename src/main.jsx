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
import Product from "./pages/Product.jsx"
import { ProtectedRoute, PublicOnlyRoute } from "./components/AuthRoutes.jsx"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
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
          <Route path="shop" element={<Shop/>}/>
          <Route path="cart" element={<Cart/>}/>
          <Route path="product/:id" element={<Product />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)