import React from 'react';
import { ShoppingCart } from 'lucide-react';

const EmptyCart = ({ onContinueShopping }) => {
  return (
    <div className="text-center py-12">
      <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
      <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
      <button
        className="bg-gray-900 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800"
        onClick={onContinueShopping}
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default EmptyCart;