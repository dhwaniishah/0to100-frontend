import React, {useState, useEffect} from 'react';
import {Link, useParams, useNavigate} from 'react-router';
import axios from 'axios';
import {RefreshCw, AlertCircle, ChevronLeft, Package, Truck, CheckCircle, XCircle} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const OrderPage = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('You must be logged in to view order details');
      }

      const response = await axios.get(`${API_URL}/order/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Check if data exists and has the right structure
      if (!response.data.data) {
        throw new Error('No order data returned from server');
      }

      console.log('Order data:', response.data.data);
      const orderData = response.data.data;
      setOrder(orderData);

      // Fetch product details for each product in the order
      if (orderData.products && Array.isArray(orderData.products)) {
        await fetchProductDetails(orderData.products);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for each product to get images and full information
  const fetchProductDetails = async (products) => {
    const token = localStorage.getItem('token');
    const details = {};

    try {
      const productFetches = products.map(async (item) => {
        // If product is already an object with all details, use it
        if (item.product && typeof item.product === 'object' && item.product.name) {
          details[item.product._id] = item.product;
          return;
        }

        // If product is just an ID, fetch its details
        const productId = typeof item.product === 'string' ? item.product : item.product?._id;

        if (!productId) {
          console.log('No valid product ID found for item:', item);
          return;
        }

        try {
          const response = await axios.get(`${API_URL}/product/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.data && response.data.data) {
            details[productId] = response.data.data;
          }
        } catch (error) {
          console.error(`Error fetching details for product ${productId}:`, error);
        }
      });

      await Promise.all(productFetches);
      console.log('Product details:', details);
      setProductDetails(details);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  // Format date with fallback
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const options = {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'};
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString; // Return the original string if formatting fails
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Package className="h-8 w-8 text-yellow-500"/>;
      case 'shipped':
        return <Truck className="h-8 w-8 text-blue-500"/>;
      case 'delivered':
        return <CheckCircle className="h-8 w-8 text-green-500"/>;
      case 'cancelled':
        return <XCircle className="h-8 w-8 text-red-500"/>;
      default:
        return <Package className="h-8 w-8 text-gray-500"/>;
    }
  };

  // Get status color class
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle safe product access (for when products might be populated objects or just IDs)
  const getProductInfo = (productItem) => {
    const productId = typeof productItem.product === 'string'
      ? productItem.product
      : productItem.product?._id;

    // If we have fetched detailed product info
    if (productId && productDetails[productId]) {
      return {
        id: productId,
        name: productDetails[productId].name || 'Unknown Product',
        price: productItem.price || productDetails[productId].price || 0,
        quantity: productItem.quantity || 1,
        image: productDetails[productId].imageUrl || '/api/placeholder/100/100',
        description: productDetails[productId].description || ''
      };
    }

    // If product is populated as an object in the order
    if (productItem.product && typeof productItem.product === 'object') {
      return {
        id: productItem.product._id || 'Unknown ID',
        name: productItem.product.name || 'Unknown Product',
        price: productItem.price || productItem.product.price || 0,
        quantity: productItem.quantity || 1,
        image: productItem.product.imageUrl || '/api/placeholder/100/100',
        description: productItem.product.description || ''
      };
    }

    // Fallback for when we don't have product details
    return {
      id: typeof productItem.product === 'string' ? productItem.product : 'Unknown ID',
      name: `Product #${typeof productItem.product === 'string' ? productItem.product.substring(0, 8) + '...' : 'Unknown'}`,
      price: productItem.price || 0,
      quantity: productItem.quantity || 1,
      image: '/api/placeholder/100/100',
      description: ''
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw size={32} className="text-gray-400 animate-spin"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} className="mr-1"/>
              <span>Back to Orders</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-start">
                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="font-medium">We couldn't load your order details</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} className="mr-1"/>
              <span>Back to Orders</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4"/>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safely get total price
  const totalPrice = order.totalPrice ||
    (order.products && Array.isArray(order.products)
      ? order.products.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      : 0);

  // Ensure products is an array
  const products = Array.isArray(order.products) ? order.products : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Simple header with back button */}
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={20} className="mr-1"/>
            <span>Back to Orders</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {/* Order summary */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Order #{order._id}</h2>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">
                      {order.status === 'pending' && 'Your order is being processed'}
                      {order.status === 'shipped' && 'Your order has been shipped'}
                      {order.status === 'delivered' && 'Your order has been delivered'}
                      {order.status === 'cancelled' && 'Your order has been cancelled'}
                      {!order.status && 'Order status unknown'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {order.status === 'pending' && 'We are preparing your items for shipment.'}
                      {order.status === 'shipped' && 'Your package is on its way.'}
                      {order.status === 'delivered' && 'Your package has been delivered.'}
                      {order.status === 'cancelled' && 'This order has been cancelled.'}
                      {!order.status && 'Please contact customer support for more information.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                  <tr>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No items in this order
                      </td>
                    </tr>
                  ) : (
                    products.map((item, index) => {
                      const productInfo = getProductInfo(item);
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                <img
                                  src={productInfo.image || "/api/placeholder/64/64"}
                                  alt={productInfo.name}
                                  className="h-full w-full object-cover object-center"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/api/placeholder/64/64";
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {productInfo.name}
                                </div>
                                {productInfo.description && (
                                  <div className="text-sm text-gray-500 max-w-xs truncate">
                                    {productInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ${Number(productInfo.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {productInfo.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            ${(Number(productInfo.price) * Number(productInfo.quantity)).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order summary */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                {/* Calculate subtotal, tax, and total - matching checkout page */}
                {(() => {
                  const subtotal = Number(totalPrice);
                  const shipping = 7.99;
                  const tax = subtotal * 0.07; // 7% tax rate
                  const finalTotal = subtotal + shipping + tax;

                  return (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900 font-medium">${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Tax (7%)</span>
                        <span className="text-gray-900 font-medium">${tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 my-4"></div>
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-bold">Total</span>
                        <span className="text-gray-900 font-bold">${finalTotal.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Shipping information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 mb-2">This is a placeholder for shipping information</p>
                <p className="text-gray-600 mb-2">Your order will be shipped to the address on file.</p>
              </div>
            </div>

            {/* Need help? */}
            <div className="mt-8 text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Need help with your order?</h3>
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-500 text-sm">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;