import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShoppingCart, X, AlertCircle, Trash } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPopout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemBeingRemoved, setItemBeingRemoved] = useState(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  const {
    cart,
    cartTotal,
    cartCount,
    loading,
    error,
    removeFromCart,
    fetchCart
  } = useCart();

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
    if (!isOpen) {
      // Refresh cart when opening
      fetchCart();
    }
    setIsOpen(!isOpen);
  };

  const handleRemoveItem = async (productId) => {
    if (!productId) {
      console.error("Cannot remove item: missing product ID");
      return;
    }

    setItemBeingRemoved(productId);
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setItemBeingRemoved(null);
    }
  };

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsOpen(false);
    navigate('/cart');
  };

  // Format price safely to avoid NaN
  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Extract product ID safely
  const getProductId = (item) => {
    if (!item) return null;

    if (item.product) {
      if (typeof item.product === 'object' && item.product._id) {
        return item.product._id;
      }
      return item.product; // If product is just the ID
    }
    return null;
  };

  return (
    <div className="relative" ref={cartRef}>
      {/* Cart Icon */}
      <button
        className="p-2 text-gray-800 hover:text-gray-600 relative"
        onClick={toggleCart}
        aria-label="Shopping cart"
      >
        <ShoppingCart className="h-6 w-6" />

        {/* Badge showing number of items */}
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {/* Popout Cart */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-lg z-50 border border-gray-200">
          {/* Cart Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Shopping Cart ({cartCount})</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-6 text-center">
              <div className="loading loading-spinner loading-sm mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading your cart...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="py-4 px-4 text-center">
              <div className="flex items-center justify-center text-red-500 mb-2">
                <AlertCircle size={20} />
              </div>
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchCart}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty Cart */}
          {!loading && !error && (!cart || cart.length === 0) && (
            <div className="py-6 text-center">
              <ShoppingCart className="h-10 w-10 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Your cart is empty</p>
            </div>
          )}

          {/* Cart Items */}
          {!loading && !error && cart && cart.length > 0 && (
            <div className="max-h-60 overflow-y-auto p-2">
              <ul className="divide-y divide-gray-100">
                {cart.map((item, index) => {
                  if (!item) return null;

                  const productId = getProductId(item);
                  if (!productId) return null;

                  const product = item.product || {};
                  const productName = typeof product === 'object' ? product.name : 'Product';

                  let productPrice = 0;
                  if (typeof product === 'object' && product.price) {
                    productPrice = parseFloat(product.price) || 0;
                  } else if (item.price) {
                    productPrice = parseFloat(item.price) || 0;
                  }

                  const productImage = typeof product === 'object' ?
                    (product.imageUrl || '/api/placeholder/80/80') :
                    '/api/placeholder/80/80';

                  return (
                    <li key={`${productId}-${index}`} className="py-2 flex">
                      {/* Product Image */}
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                        <img
                          src={productImage}
                          alt={productName}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="ml-3 flex-1 flex flex-col text-sm">
                        <div className="font-medium text-gray-900 line-clamp-1">{productName}</div>
                        <div className="mt-1 flex justify-between text-gray-500">
                          <span>{item.quantity || 1} × ${formatPrice(productPrice)}</span>
                          {itemBeingRemoved === productId ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <button
                              onClick={() => handleRemoveItem(productId)}
                              className="text-red-400 hover:text-red-500"
                              aria-label="Remove item"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Cart Footer */}
          {!loading && !error && cart && cart.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between text-sm font-medium text-gray-900 mb-3">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleViewCart}
                  className="text-center py-2 px-4 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="text-center py-2 px-4 border border-transparent rounded-md text-xs font-medium text-white bg-gray-900 hover:bg-gray-800"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPopout;