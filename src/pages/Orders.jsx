import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import { RefreshCw, AlertCircle, ChevronRight, Package } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status badge colors
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('You must be logged in to view orders');
      }

      const response = await axios.get(`${API_URL}/order`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">My Orders</h1>
            <button
              onClick={fetchOrders}
              className="btn btn-sm btn-outline border-white text-white hover:bg-gray-700"
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <RefreshCw size={32} className="text-gray-400 animate-spin mb-4" />
                <p className="text-gray-500">Loading orders...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">We couldn't load your orders</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* No orders */}
          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-12">
              <div className="h-20 w-20 mx-auto text-gray-400 mb-4">
                <Package size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
              <Link
                to="/shop"
                className="btn btn-sm bg-gray-800 text-white hover:bg-gray-700"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {/* Orders list */}
          {!loading && !error && orders.length > 0 && (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order._id} className="p-6 hover:bg-gray-50">
                  <Link to={`/order/${order._id}`} className="block">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-2">
                          <span className="text-sm text-gray-500 mr-2">Order ID:</span>
                          <span className="text-sm font-medium">{order._id}</span>
                        </div>
                        <div className="mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Placed on {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end">
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          ${order.totalPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {order.products.length} {order.products.length === 1 ? 'item' : 'items'}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-indigo-600">
                          <span>View Order Details</span>
                          <ChevronRight size={16} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;