import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.API_URL;

/**
 * Component to display low stock notifications on the admin dashboard
 * @param {number} threshold - Stock level threshold to consider "low" (default: 5)
 * @param {number} limit - Maximum number of items to display (default: 5)
 * @param {boolean} showHeader - Whether to show the section header (default: true)
 */
const LowStockNotifications = ({ threshold = 5, limit = 5, showHeader = true }) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch low stock items from inventory
  const fetchLowStockItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/inventory/low-stock?threshold=${threshold}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Limit the number of items to display if specified
      const items = response.data.data || [];
      setLowStockItems(items.slice(0, limit));
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      setError(error.response?.data?.error || error.message || 'Failed to load low stock data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLowStockItems();
  }, [threshold, limit]);

  // Get status color based on stock level
  const getStatusColor = (stock) => {
    if (stock === 0) return 'text-red-500 bg-red-50';
    if (stock <= 2) return 'text-orange-500 bg-orange-50';
    return 'text-yellow-500 bg-yellow-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <AlertTriangle size={18} className="text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">Low Stock Alerts</h3>
          </div>
          <button
            onClick={fetchLowStockItems}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
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

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <RefreshCw className="animate-spin mr-2 text-gray-500" size={20} />
            <p className="text-gray-500">Loading inventory data...</p>
          </div>
        ) : lowStockItems.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p>All products are well-stocked!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h4>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.stock)}`}>
                      {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Category: {item.product?.category || 'Uncategorized'}
                  </p>
                </div>
                <a
                  href={`/admin?section=inventory&productId=${item.product?._id}`}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <ChevronRight size={18} />
                </a>
              </div>
            ))}

            {lowStockItems.length > 0 && (
              <div className="pt-2 text-right">
                <a
                  href="/admin?section=inventory"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  View all low stock items
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockNotifications;