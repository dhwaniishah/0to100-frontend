// CartPopout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';

// Sample cart data - replace with your actual cart state
const sampleCartItems = [
  {
    id: 1,
    name: 'Premium Brake Pads',
    price: 89.99,
    quantity: 2,
    image: '/images/products/brake-pads.jpg', // Replace with your image path
  },
  {
    id: 2,
    name: 'Synthetic Engine Oil',
    price: 42.50,
    quantity: 1,
    image: '/images/products/engine-oil.jpg', // Replace with your image path
  }
];

const CartPopout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState(sampleCartItems);
  const cartRef = useRef(null);

  // Calculate total number of items in cart
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div className="relative" ref={cartRef}>
      {/* Cart Icon - replacing your current cart icon */}
      <button
        className="p-2 text-gray-800 hover:text-gray-600 relative"
        onClick={toggleCart}
        aria-label="Shopping cart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>

        {/* Badge showing number of items */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Popout Cart */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-lg z-50 border border-gray-200">
          {/* Cart Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Shopping Cart ({itemCount})</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="max-h-60 overflow-y-auto p-2">
            {cartItems.length === 0 ? (
              <div className="py-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <li key={item.id} className="py-2 flex">
                    {/* Product Image */}
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {e.target.onerror = null; e.target.src="/images/placeholder.jpg"}}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="ml-3 flex-1 flex flex-col text-sm">
                      <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
                      <div className="mt-1 flex justify-between text-gray-500">
                        <span>{item.quantity} × ${item.price.toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-gray-500"
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between text-sm font-medium text-gray-900 mb-3">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/cart"
                  className="text-center py-2 px-4 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 no-underline"
                  onClick={() => setIsOpen(false)}
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  className="text-center py-2 px-4 border border-transparent rounded-md text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 no-underline"
                  onClick={() => setIsOpen(false)}
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPopout;