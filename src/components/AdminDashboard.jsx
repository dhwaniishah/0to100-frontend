import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package, Users, ShoppingCart, Database, RefreshCw, AlertCircle
} from 'lucide-react';
import OrderManagement from './OrderManagement';
import LowStockNotifications from './LowStockNotifications';

const API_URL = import.meta.env.API_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Fetch products count
      const productsRes = await axios.get(`${API_URL}/product`, { headers });
      if (productsRes.data.error) throw new Error(productsRes.data.error);
      const products = productsRes.data.data || [];

      // Fetch orders
      const ordersRes = await axios.get(`${API_URL}/order`, { headers });
      if (ordersRes.data.error) throw new Error(ordersRes.data.error);
      const orders = ordersRes.data.data || [];

      // Fetch user count - using the dedicated endpoint
      const usersRes = await axios.get(`${API_URL}/user/count`, { headers });
      if (usersRes.data.error) throw new Error(usersRes.data.error);
      const userCount = usersRes.data.data?.count || 0;

      // Fetch low stock count
      const lowStockRes = await axios.get(`${API_URL}/inventory/low-stock?threshold=5`, { headers });
      const lowStockCount = lowStockRes.data.data?.length || 0;

      // Calculate total revenue from orders
      const totalRevenue = orders.reduce((total, order) => {
        return total + (Number(order.totalPrice) || 0);
      }, 0);

      setStats({
        products: products.length,
        orders: orders.length,
        customers: userCount,
        revenue: totalRevenue,
        lowStockCount
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, loading, warning = false }) => (
    <div className={`bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4 ${warning ? 'border-l-4 border-yellow-400' : ''}`}>
      <div className={`${warning ? 'bg-yellow-100' : 'bg-gray-100'} p-3 rounded-full`}>
        <Icon className={`${warning ? 'text-yellow-600' : 'text-gray-600'}`} size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        {loading ? (
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <p className="text-lg font-semibold text-gray-800">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
        <button
          onClick={fetchDashboardStats}
          disabled={loading}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          title="Total Products"
          value={stats.products}
          loading={loading}
        />
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats.orders}
          loading={loading}
        />
        <StatCard
          icon={Users}
          title="Total Customers"
          value={stats.customers}
          loading={loading}
        />
        <StatCard
          icon={Database}
          title={stats.lowStockCount > 0 ? `Low Stock Items (${stats.lowStockCount})` : "Inventory Status"}
          value={stats.lowStockCount > 0 ? `${stats.lowStockCount} items` : "All Stocked"}
          loading={loading}
          warning={stats.lowStockCount > 0}
        />
      </div>

      {/* Dashboard main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low stock notifications */}
        <div className="lg:col-span-1">
          <LowStockNotifications threshold={5} limit={5} />
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Orders</h3>
            <OrderManagement limit={5} showHeader={false} />
          </div>
        </div>
      </div>

      {/* Revenue information */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Revenue Overview</h3>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">${stats.revenue.toFixed(2)}</p>
          </div>

          <div className="mt-4 md:mt-0 text-center">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
              <span className="font-medium">Average Order Value:</span> $
              {stats.orders > 0
                ? (stats.revenue / stats.orders).toFixed(2)
                : '0.00'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;