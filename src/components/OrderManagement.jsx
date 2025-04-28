import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, AlertCircle, ShoppingCart, Info } from 'lucide-react';

const API_URL = import.meta.env.API_URL;

// Order status badge component
const OrderStatusBadge = ({ status }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Order details modal
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Order Details #{order._id.slice(-8)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">Status</p>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">
              {order.user?.name || 'Unknown'} ({order.user?.email || 'No email'})
            </p>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Items</h4>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {order.products.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.product?.name || `Product ${item.product}`}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    ${item.price?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    ${(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
              </tbody>
              <tfoot>
              <tr>
                <td colSpan="3" className="px-4 py-2 text-right font-medium">
                  Total:
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  ${order.totalPrice?.toFixed(2) || '0.00'}
                </td>
              </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderManagement = ({ limit = null, showHeader = true }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/order`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Get all orders or limit them if specified
      let ordersData = response.data.data || [];
      if (limit && limit > 0) {
        ordersData = ordersData.slice(0, limit);
      }

      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.error || error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdateLoading(orderId);
    setError(null);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/order/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Show success message
      setSuccessMessage(`Order #${orderId.slice(-8)} updated to ${newStatus}`);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error("Error updating order status:", error);
      setError(error.response?.data?.error || error.message || 'Failed to update order status');
    } finally {
      setUpdateLoading(null);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  useEffect(() => {
    fetchOrders();
  }, [limit]);

  const orderStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className={`bg-white rounded-lg shadow-sm ${!showHeader ? 'border-0' : ''}`}>
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Orders</h2>
          <button
            onClick={fetchOrders}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 my-2">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="animate-spin mr-2 text-gray-500" size={20} />
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : !error && orders.length === 0 ? (
        <div className="text-center p-6 text-gray-500">
          <ShoppingCart className="mx-auto mb-2" size={24} />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
            </thead>
            <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      #{order._id.slice(-8)}
                      <Info size={14} className="ml-1" />
                    </button>
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-800">{order.user?.name || 'Unknown'}</td>
                <td className="p-3 text-sm text-gray-800">${order.totalPrice.toFixed(2)}</td>
                <td className="p-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="p-3 text-right">
                  <div className="relative inline-block text-left">
                    {updateLoading === order._id ? (
                      <div className="flex items-center">
                        <RefreshCw size={14} className="animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Updating...</span>
                      </div>
                    ) : (
                      <select
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        value={order.status}
                        className="text-sm bg-transparent border-none focus:outline-none"
                        disabled={updateLoading !== null}
                      >
                        {orderStatuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={closeOrderDetails}
        />
      )}
    </div>
  );
};

export default OrderManagement;