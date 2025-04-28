import React from 'react';
import { useNavigate } from 'react-router';

const CheckoutSummary = ({ items, buttonText = "Checkout", onCheckoutClick }) => {
  const navigate = useNavigate();

  // Calculate subtotal - handle different item data structures
  const subtotal = items.reduce((total, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);

  const shipping = 7.99;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (onCheckoutClick) {
      onCheckoutClick();
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="border-t border-gray-200 py-4">
      <div className="flex justify-between text-base text-gray-500 mb-2">
        <p>Subtotal</p>
        <p>${subtotal.toFixed(2)}</p>
      </div>
      <div className="flex justify-between text-base text-gray-500 mb-2">
        <p>Shipping</p>
        <p>${shipping.toFixed(2)}</p>
      </div>
      <div className="flex justify-between text-base text-gray-500 mb-4">
        <p>Tax (7%)</p>
        <p>${tax.toFixed(2)}</p>
      </div>
      <div className="flex justify-between text-base font-medium text-gray-900 mb-6">
        <p>Total</p>
        <p>${total.toFixed(2)}</p>
      </div>
      <button
        className="w-full bg-gray-900 py-3 px-4 rounded-md text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
        onClick={handleCheckout}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default CheckoutSummary;