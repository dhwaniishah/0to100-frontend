import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router';
import {
  CreditCard,
  Calendar,
  Lock,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import {useCart} from '../context/CartContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {cart, cartTotal, fetchCart, clearCart} = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [validatingInventory, setValidatingInventory] = useState(true);
  const [inventoryIssues, setInventoryIssues] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Validate inventory when component mounts and when cart changes
  useEffect(() => {
    const validateCartInventory = async () => {
      setValidatingInventory(true);
      setInventoryIssues([]);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('You must be logged in to complete checkout');
        }

        // Check inventory availability for cart items
        // This calls the inventory/check-availability endpoint instead of cart/validate
        // which might not be implemented yet
        const cartItems = cart.map(item => {
          const product = item.product || {};
          const productId = typeof product === 'object' ? product._id : item.product;

          return {
            productId,
            quantity: item.quantity || 1
          };
        }).filter(item => item.productId);

        // Skip validation if there are no valid items
        if (cartItems.length === 0) {
          setValidatingInventory(false);
          return;
        }

        const response = await axios.post(`${API_URL}/inventory/check-availability`,
          {items: cartItems},
          {headers: {Authorization: `Bearer ${token}`}}
        );

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        const result = response.data.data;

        if (!result.success) {
          // Map inventory issues to include product names
          const issues = result.insufficientItems.map(issue => {
            const cartItem = cart.find(item => {
              const product = item.product || {};
              const productId = typeof product === 'object' ? product._id : item.product;
              return productId === issue.productId;
            });

            const product = cartItem?.product || {};
            const productName = typeof product === 'object' ? product.name : `Product ${issue.productId}`;

            return {
              ...issue,
              productName
            };
          });

          setInventoryIssues(issues);
        }
      } catch (error) {
        console.error('Inventory validation error:', error);
        setError('There was a problem validating your cart. Please try again.');
      } finally {
        setValidatingInventory(false);
      }
    };

    // Refresh cart first, then validate inventory
    if (cart && cart.length > 0) {
      validateCartInventory();
    } else {
      setValidatingInventory(false);
    }
  }, [cart]);

  const handleInputChange = (e) => {
    const {name, value} = e.target;

    // Format card number with spaces
    if (name === 'cardNumber') {
      const sanitizedValue = value.replace(/\s/g, '').replace(/\D/g, '');
      let formattedValue = sanitizedValue;

      if (sanitizedValue.length > 0) {
        formattedValue = sanitizedValue.match(/.{1,4}/g).join(' ');
      }

      if (formattedValue.length <= 19) { // 16 digits + 3 spaces
        setFormData({
          ...formData,
          [name]: formattedValue
        });
      }
    }
    // Format expiry date with slash
    else if (name === 'expiryDate') {
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      let formattedValue = sanitizedValue;

      if (sanitizedValue.length > 2) {
        formattedValue = `${sanitizedValue.substring(0, 2)}/${sanitizedValue.substring(2, 4)}`;
      }

      setFormData({
        ...formData,
        [name]: formattedValue
      });
    }
    // CVV should only be numbers
    else if (name === 'cvv') {
      const sanitizedValue = value.replace(/\D/g, '').substring(0, 4);
      setFormData({
        ...formData,
        [name]: sanitizedValue
      });
    }
    // Normal input handling
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Shipping info validation
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';

    // Payment info validation
    if (!formData.cardName.trim()) errors.cardName = 'Name on card is required';

    // Card number validation (16 digits, can contain spaces)
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardNumber)) {
      errors.cardNumber = 'Card number must be 16 digits';
    }

    // Expiry date validation (MM/YY format)
    if (!formData.expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      errors.expiryDate = 'Expiry date must be in MM/YY format';
    }

    // CVV validation (3-4 digits)
    if (!formData.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        document.getElementsByName(firstErrorField)[0]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }

    // If there are inventory issues, don't allow checkout
    if (inventoryIssues.length > 0) {
      setError('Please resolve inventory issues before placing your order.');
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to complete checkout');
      }

      // Create order data from cart items
      const orderItems = cart.map(item => {
        const product = item.product || {};
        const productId = typeof product === 'object' ? product._id : item.product;
        const price = typeof product === 'object' && product.price ?
          parseFloat(product.price) :
          parseFloat(item.price) || 0;

        return {
          product: productId,
          quantity: item.quantity || 1,
          price
        };
      }).filter(item => item.product && !isNaN(item.price));

      // Send order to server
      const response = await axios.post(
        `${API_URL}/order`,
        {
          products: orderItems,
          shippingAddress: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          // We don't send actual card details to the server in a real app
          // Just send payment method info
          paymentMethod: 'credit_card',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Set success and get order ID if available
      setSuccess(true);
      if (response.data.data && response.data.data._id) {
        setOrderId(response.data.data._id);
      }

      // Clear the cart after successful order
      clearCart();

      // Scroll to top to show success message
      window.scrollTo(0, 0);

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.error || error.message || 'An error occurred during checkout. Please try again.');

      // Refresh cart to get latest inventory status
      fetchCart();

      // Scroll to error message
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToShopping = () => {
    navigate('/shop');
  };

  const handleViewOrder = () => {
    navigate(`/order/${orderId}`);
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  // Filter valid cart items
  const validCartItems = (cart || []).filter(item => {
    return item && item.product;
  });

  // Format price
  const formatPrice = (price) => {
    return (price || 0).toFixed(2);
  };

  // Success page
  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600"/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. Your order has been placed successfully.
              {orderId && <span> Your order number is: <span className="font-medium">{orderId}</span></span>}
            </p>
            <p className="text-gray-600 mb-6">
              We've sent a confirmation email with your order details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {orderId && (
                <button
                  onClick={handleViewOrder}
                  className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  View Order
                </button>
              )}
              <button
                onClick={handleBackToShopping}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if cart is empty
  if (validCartItems.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-gray-400"/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Add some items to your cart before proceeding to checkout.
            </p>
            <button
              onClick={handleBackToShopping}
              className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
            >
              Go to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Item count
  const itemCount = validCartItems.reduce((count, item) => {
    return count + (parseInt(item.quantity) || 1);
  }, 0);

  // Calculate shipping, tax, etc.
  const shipping = 7.99;
  const tax = cartTotal * 0.07; // 7% tax
  const total = cartTotal + shipping + tax;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your purchase securely</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start max-w-3xl mx-auto">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5"/>
            <span>{error}</span>
          </div>
        )}

        {/* Inventory Issues Alert */}
        {inventoryIssues.length > 0 && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md max-w-3xl mx-auto">
            <div className="flex items-start mb-2">
              <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5"/>
              <span className="font-medium">Inventory issues detected</span>
            </div>
            <ul className="list-disc pl-8 space-y-1 text-sm">
              {inventoryIssues.map((issue, index) => (
                <li key={index}>
                  {issue.productName}: Requested {issue.requested}, only {issue.available} available
                </li>
              ))}
            </ul>
            <div className="mt-2 text-sm">
              <button
                onClick={handleBackToCart}
                className="font-medium underline"
              >
                Return to cart
              </button>
              to update quantities.
            </div>
          </div>
        )}

        {/* Loading overlay for inventory validation */}
        {validatingInventory && (
          <div
            className="mb-8 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md flex items-center justify-center max-w-3xl mx-auto">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
            <span>Validating inventory...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Shipping Information */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        formErrors.fullName ? 'border-red-300' : 'border-gray-300'
                      } p-2 focus:border-gray-500 focus:ring-gray-500`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        formErrors.email ? 'border-red-300' : 'border-gray-300'
                      } p-2 focus:border-gray-500 focus:ring-gray-500`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        formErrors.address ? 'border-red-300' : 'border-gray-300'
                      } p-2 focus:border-gray-500 focus:ring-gray-500`}
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        formErrors.city ? 'border-red-300' : 'border-gray-300'
                      } p-2 focus:border-gray-500 focus:ring-gray-500`}
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        formErrors.state ? 'border-red-300' : 'border-gray-300'
                      } p-2 focus:border-gray-500 focus:ring-gray-500`}
                    />
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border ${
                        formErrors.zipCode ? 'border-red-300' : 'border-gray-300'
                      } p-2 focus:border-gray-500 focus:ring-gray-500`}
                    />
                    {formErrors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.zipCode}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 p-2 focus:border-gray-500 focus:ring-gray-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="MX">Mexico</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400"/>
                      </div>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 rounded-md border ${
                          formErrors.cardName ? 'border-red-300' : 'border-gray-300'
                        } p-2 focus:border-gray-500 focus:ring-gray-500`}
                      />
                    </div>
                    {formErrors.cardName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cardName}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400"/>
                      </div>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="•••• •••• •••• ••••"
                        className={`block w-full pl-10 rounded-md border ${
                          formErrors.cardNumber ? 'border-red-300' : 'border-gray-300'
                        } p-2 focus:border-gray-500 focus:ring-gray-500`}
                      />
                    </div>
                    {formErrors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cardNumber}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      For testing: 4242 4242 4242 4242
                    </p>
                  </div>

                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400"/>
                      </div>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className={`block w-full pl-10 rounded-md border ${
                          formErrors.expiryDate ? 'border-red-300' : 'border-gray-300'
                        } p-2 focus:border-gray-500 focus:ring-gray-500`}
                      />
                    </div>
                    {formErrors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400"/>
                      </div>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="•••"
                        className={`block w-full pl-10 rounded-md border ${
                          formErrors.cvv ? 'border-red-300' : 'border-gray-300'
                        } p-2 focus:border-gray-500 focus:ring-gray-500`}
                      />
                    </div>
                    {formErrors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cvv}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading || validatingInventory || inventoryIssues.length > 0}
                    className="w-full bg-gray-900 py-3 rounded-md text-white font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : inventoryIssues.length > 0 ? (
                      <>Resolve inventory issues</>
                    ) : validatingInventory ? (
                      <>Validating inventory...</>
                    ) : (
                      <>Place Order - ${formatPrice(total)}</>
                    )}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <Lock className="h-3 w-3 mr-1"/>
                    Your payment information is secure
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                {/* Item count */}
                <div className="text-sm text-gray-600 mb-4">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                      {/* Item count */}
                      <div className="text-sm text-gray-600 mb-4">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                      </div>

                      {/* Cart items summary */}
                      <div className="max-h-64 overflow-y-auto mb-4">
                        {validCartItems.map((item, index) => {
                          if (!item || !item.product) return null;

                          const product = item.product || {};
                          const productName = typeof product === 'object' ? product.name : 'Product';

                          let productPrice = 0;
                          if (typeof product === 'object' && product.price) {
                            productPrice = parseFloat(product.price) || 0;
                          } else if (item.price) {
                            productPrice = parseFloat(item.price) || 0;
                          }

                          const quantity = parseInt(item.quantity) || 1;
                          const itemTotal = productPrice * quantity;

                          // Check if this item has inventory issues
                          const hasInventoryIssue = inventoryIssues.some(issue => {
                            const issueProductId = issue.productId;
                            const itemProductId = typeof product === 'object' ? product._id : item.product;
                            return issueProductId === itemProductId;
                          });

                          return (
                            <div key={index}
                                 className={`flex justify-between py-2 border-b border-gray-100 last:border-b-0 ${hasInventoryIssue ? 'bg-yellow-50' : ''}`}>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-800">{productName}</p>
                                  {hasInventoryIssue && (
                                    <span className="ml-2 text-xs px-1 bg-yellow-100 text-yellow-800 rounded">Stock issue</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">Qty: {quantity}</p>
                              </div>
                              <p className="text-sm text-gray-800">${formatPrice(itemTotal)}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Price breakdown */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-600">Subtotal</p>
                          <p className="text-gray-800">${formatPrice(cartTotal)}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-600">Shipping</p>
                          <p className="text-gray-800">${formatPrice(shipping)}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-600">Tax (7%)</p>
                          <p className="text-gray-800">${formatPrice(tax)}</p>
                        </div>
                        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-base font-medium">
                          <p className="text-gray-900">Total</p>
                          <p className="text-gray-900">${formatPrice(total)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <MapPin className="h-5 w-5 text-gray-400"/>
                          </div>
                          <div className="ml-3 text-sm text-gray-600">
                            <p className="font-medium">Standard Shipping</p>
                            <p>Delivery in 3-5 business days</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <Lock className="h-5 w-5 text-gray-400"/>
                          </div>
                          <div className="ml-3 text-sm text-gray-600">
                            <p className="font-medium">Secure Payment</p>
                            <p>SSL encrypted checkout</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back to cart button */}
                  <div className="mt-4">
                    <button
                      onClick={handleBackToCart}
                      className="w-full bg-white border border-gray-300 py-2 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center"
                    >
                      Back to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CheckoutPage;