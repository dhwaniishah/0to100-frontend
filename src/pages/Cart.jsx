import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, RefreshCw, AlertCircle, Plus, Minus, Trash } from 'lucide-react';
import CheckoutSummary from '../components/CheckoutSummary';
import EmptyCart from '../components/EmptyCart';
import { useCart } from '../context/CartContext';

const CartItem = ({ item, onUpdateQuantity, onRemove, removingId }) => {
  // Extract product data safely
  const product = item.product || {};
  const productId = typeof product === 'object' ? product._id : item.product;
  const productName = typeof product === 'object' ? product.name : 'Product';

  // Handle price safely
  let productPrice = 0;
  if (typeof product === 'object' && product.price) {
    productPrice = parseFloat(product.price) || 0;
  } else if (item.price) {
    productPrice = parseFloat(item.price) || 0;
  }

  const quantity = item.quantity || 1;

  // Get image URL
  const productImage = typeof product === 'object' ?
    (product.imageUrl || '/api/placeholder/400/400') :
    '/api/placeholder/400/400';

  // Format price safely
  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const isBeingRemoved = removingId === productId;

  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <img src={productImage} alt={productName} className="h-full w-full object-cover object-center" />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <h3>{productName}</h3>
          <p className="ml-4">${formatPrice(productPrice)}</p>
        </div>

        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => onUpdateQuantity(productId, quantity - 1)}
              disabled={quantity <= 1 || isBeingRemoved}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <span className="px-3 py-1">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(productId, quantity + 1)}
              disabled={isBeingRemoved}
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => onRemove(productId)}
            disabled={isBeingRemoved}
            className="font-medium text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center"
          >
            {isBeingRemoved ? (
              <span className="loading loading-spinner loading-xs mr-1"></span>
            ) : (
              <Trash size={16} className="mr-1" />
            )}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const {
    cart,
    cartTotal,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    fetchCart
  } = useCart();

  const [removingItemId, setRemovingItemId] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const navigate = useNavigate();

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1 || !productId) return;

    setUpdatingItemId(productId);
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!productId) return;

    setRemovingItemId(productId);
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  const handleRefreshCart = () => {
    fetchCart();
  };

  // Filter out invalid items and format cart items for the checkout summary
  const validCartItems = (cart || []).filter(item => {
    // Filter out null items
    if (!item) return false;

    // Filter out items without valid product reference
    if (!item.product) return false;

    // Keep the item if it has either a product object with price or its own price
    if (typeof item.product === 'object' && item.product.price) return true;
    if (item.price) return true;

    return false;
  });

  // Format cart items for the checkout summary
  const cartItemsForSummary = validCartItems.map(item => {
    const product = item.product || {};
    let price = 0;

    if (typeof product === 'object' && product.price) {
      price = parseFloat(product.price) || 0;
    } else if (item.price) {
      price = parseFloat(item.price) || 0;
    }

    return {
      ...item,
      price
    };
  });

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw size={32} className="text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start mb-6">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading cart</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={handleRefreshCart}
              className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 inline-flex items-center"
            >
              <RefreshCw size={14} className="mr-1" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!validCartItems.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>
        <EmptyCart onContinueShopping={handleContinueShopping} />
      </div>
    );
  }

  // Cart with items
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        <div className="flex items-center">
          <button
            onClick={handleRefreshCart}
            className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
          >
            <RefreshCw size={16} className="mr-1" />
            Refresh
          </button>
          <button
            onClick={handleContinueShopping}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <ShoppingBag size={16} className="mr-1" />
            Continue Shopping
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Cart Items ({validCartItems.length})
            </h2>
            <div>
              {validCartItems.map((item, index) => {
                const product = item.product || {};
                const productId = typeof product === 'object' ? product._id : item.product;

                if (!productId) return null;

                return (
                  <CartItem
                    key={`${productId}-${index}`}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    removingId={removingItemId}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white shadow-sm rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <CheckoutSummary items={cartItemsForSummary} buttonText="Proceed to Checkout" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;