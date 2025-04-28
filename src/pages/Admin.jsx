import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package, Users, ShoppingCart, Home,
  Layers, Database, Settings, RefreshCw, AlertCircle
} from 'lucide-react';
import CompaniesSection from '../components/CompaniesSection';
import ProductManagement from '../components/ProductManagement';
import InventoryManagement from '../components/InventoryManagement';
import OrderManagement from '../components/OrderManagement';
import AdminDashboard from '../components/AdminDashboard';

const API_URL = import.meta.env.VITE_API_URL;

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        setUser(response.data.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError(error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const renderActiveSection = () => {
    switch(activeSection) {
      case 'products':
        return <ProductManagement />;
      case 'companies':
        return <CompaniesSection />;
      case 'inventory':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600">Settings section will be implemented in a future update.</p>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  const SidebarItem = ({ icon: Icon, label, section }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`
        flex items-center w-full p-2 rounded-md transition-colors duration-200
        ${activeSection === section
        ? 'bg-gray-200 text-gray-900'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }
      `}
    >
      <Icon className="mr-3" size={18} />
      <span className="text-sm">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="animate-spin mr-2 text-gray-600" size={24} />
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-lg font-semibold text-center mb-2">Access Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <a
              href="/shop"
              className="btn bg-gray-800 text-white hover:bg-gray-700"
            >
              Back to Shop
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <AlertCircle className="text-yellow-500 mx-auto mb-4" size={48} />
          <h2 className="text-lg font-semibold text-center mb-2">Access Restricted</h2>
          <p className="text-gray-600 text-center mb-6">
            You don't have permission to access the admin panel.
          </p>
          <div className="flex justify-center">
            <a
              href="/shop"
              className="btn bg-gray-800 text-white hover:bg-gray-700"
            >
              Back to Shop
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-52 bg-white border-r border-gray-200 p-4 shadow-sm">
        <div className="mb-6 p-2">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          {user && (
            <p className="text-sm text-gray-500 mt-1">{user.name || user.email}</p>
          )}
        </div>
        <nav className="space-y-1">
          <SidebarItem icon={Home} label="Dashboard" section="dashboard" />
          <SidebarItem icon={Package} label="Products" section="products" />
          <SidebarItem icon={Layers} label="Companies" section="companies" />
          <SidebarItem icon={Database} label="Inventory" section="inventory" />
          <SidebarItem icon={ShoppingCart} label="Orders" section="orders" />
          <SidebarItem icon={Settings} label="Settings" section="settings" />
        </nav>
      </div>

      <main className="flex-1 p-6 overflow-y-auto">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default AdminPage;