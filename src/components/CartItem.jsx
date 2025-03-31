// CartItem.jsx
import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <h3>{item.name}</h3>
          <p className="ml-4">${item.price.toFixed(2)}</p>
        </div>

        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <span className="px-3 py-1">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="font-medium text-gray-500 hover:text-gray-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;