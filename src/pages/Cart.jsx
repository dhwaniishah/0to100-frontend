// CartPage.jsx
import React, { useState } from 'react';
import CartItem from '../components/CartItem';
import CheckoutSummary from '../components/CheckoutSummary';
import EmptyCart from '../components/EmptyCart';
import { sampleCartItems } from '../components/CartData';

const CartPage = () => {
  const [cartItems, setCartItems] = useState(sampleCartItems);

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleContinueShopping = () => {
    // Navigate to shop page
    console.log('Continue shopping clicked');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
        <EmptyCart onContinueShopping={handleContinueShopping} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cart Items ({cartItems.length})</h2>
              <div>
                {cartItems.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white shadow-sm rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <CheckoutSummary items={cartItems} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;