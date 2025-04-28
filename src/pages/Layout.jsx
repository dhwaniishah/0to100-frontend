// Layout.jsx
import React from 'react';
import {Link, Outlet, useLocation} from 'react-router';
import Navbar from '../components/Navbar';
import Logo from "../assets/icon.png";

const Layout = () => {
  const location = useLocation();
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isShopRoute = location.pathname === '/shop' || location.pathname.startsWith('/shop/');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar/>
      <main className={`flex-grow ${
        isAuthRoute
          ? 'flex items-center justify-center'
          : 'w-full'
      }`}>
        <Outlet/>
      </main>
      {!isAuthRoute && !isShopRoute && (
        <footer className="bg-gray-800 text-white py-8 mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1">
                <Link to="/" className="flex flex-row flex-shrink-0 items-center">
                  <img src={Logo} alt="logo" className="h-20 w-20 invert" />
                  <span className="text-lg font-bold">0 to 100 Motorsports</span>
                </Link>
                <p className="mb-4 text-gray-300">Your trusted automotive partner since 2020</p>
                <p className="text-gray-300">© {new Date().getFullYear()} 0to100 Motorsports. All rights reserved.</p>
              </div>

              {/* Quick Links */}
              <div className="col-span-1">
                <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="/" className="text-gray-300 hover:text-white">Home</a></li>
                  <li><a href="/shop" className="text-gray-300 hover:text-white">Shop</a></li>
                  <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
                  <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="col-span-2">
                <h3 className="text-lg font-bold mb-4">Contact Us</h3>
                <address className="not-italic text-gray-300">
                  <p>123 Auto Street</p>
                  <p>Carville, NY 12345</p>
                  <p className="mt-2">Phone: (555) 123-4567</p>
                  <p>Email: info@autobros.com</p>
                </address>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;