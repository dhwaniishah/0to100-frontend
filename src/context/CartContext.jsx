import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.API_URL;

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart from API when component mounts
  useEffect(() => {
    fetchCart();
  }, []);

  // Update cart total and count when cart changes
  useEffect(() => {
    updateCartSummary();
  }, [cart]);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      if (response.data.data && response.data.data.products) {
        // Filter out invalid items before setting the cart
        const validProducts = (response.data.data.products || []).filter(item => {
          return item && (
            (item.product && typeof item.product === 'object') ||
            (item.product && typeof item.product === 'string')
          );
        });
        setCart(validProducts);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateCartSummary = () => {
    // Calculate total price and item count
    let total = 0;
    let count = 0;

    // Filter valid items first
    const validItems = cart.filter(item => item && item.product);

    validItems.forEach(item => {
      // Default quantity to 1 if not specified or valid
      const quantity = item.quantity && !isNaN(parseInt(item.quantity)) ?
        parseInt(item.quantity) : 1;

      // Try to get price from different possible locations
      let price = 0;

      if (item.product) {
        // If product is fully populated object with price
        if (typeof item.product === 'object' && item.product.price) {
          price = parseFloat(item.product.price) || 0;
        }
        // If item has its own price field
        else if (item.price) {
          price = parseFloat(item.price) || 0;
        }
      }

      // Only add to total if we have a valid price
      if (!isNaN(price) && price > 0) {
        total += price * quantity;
      }

      count += quantity;
    });

    setCartTotal(total);
    setCartCount(count);
  };

  const addToCart = async (productId, quantity = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // You might want to redirect to login or show a message
      return { success: false, message: 'Please login to add items to cart' };
    }

    if (!productId) {
      return { success: false, message: 'Invalid product' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/cart`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Refresh cart
      await fetchCart();
      return { success: true };

    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
      return { success: false, message: err.message || 'Failed to add item to cart' };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    const token = localStorage.getItem('token');
    if (!token || !productId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_URL}/cart`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Refresh cart
      await fetchCart();
      return { success: true };

    } catch (err) {
      console.error('Error updating cart:', err);
      setError('Failed to update cart. Please try again.');
      return { success: false, message: err.message || 'Failed to update cart' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token || !productId) {
      console.error("Cannot remove item: missing token or product ID");
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Refresh cart
      await fetchCart();
      return { success: true };

    } catch (err) {
      console.error('Error removing from cart:', err, { productId });
      setError('Failed to remove item from cart. Please try again.');
      return { success: false, message: err.message || 'Failed to remove item' };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    // If your API has a clear cart endpoint, you'd call it here
    // For now, we'll just set the cart to empty
    setCart([]);
  };

  const value = {
    cart,
    cartTotal,
    cartCount,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};