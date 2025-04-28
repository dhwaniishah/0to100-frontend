import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { RefreshCw, AlertCircle, User, Mail, Phone, MapPin, Edit } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal.jsx'; // Ensure this import path is correct

const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    shipped: 0,
    delivered: 0
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserOrders();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('You must be logged in to view your profile');
      }

      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;

      const response = await axios.get(`${API_URL}/order`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.error) {
        console.error(response.data.error);
        return;
      }

      const userOrders = response.data.data || [];
      setOrders(userOrders);

      // Calculate order statistics
      const stats = {
        total: userOrders.length,
        pending: userOrders.filter(order => order.status === 'pending').length,
        shipped: userOrders.filter(order => order.status === 'shipped').length,
        delivered: userOrders.filter(order => order.status === 'delivered').length
      };
      setOrderStats(stats);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    setIsEditModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw size={32} className="text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-start">
                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">We couldn't load your profile</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-sm bg-gray-800 text-white hover:bg-gray-700"
              >
                Go to Login
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
              <p className="text-gray-500 mb-6">We couldn't find your profile information.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-sm bg-gray-800 text-white hover:bg-gray-700"
                >
                  Go to Login
                </button>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateSuccess={handleUpdateProfile}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-outline text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                    <User size={32} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500">
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Shipping Address</p>
                        <p className="text-gray-900">{user.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Activity */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>

                {orders.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="mt-4 btn btn-sm bg-gray-800 text-white hover:bg-gray-700"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {orders.slice(0, 3).map(order => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">Order ID:</span>
                                <span className="text-sm font-medium">{order._id.substring(0, 8)}...</span>
                              </div>
                              <div className="mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                  ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'}`}
                                >
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">${order.totalPrice.toFixed(2)}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate('/orders')}
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        View All Orders
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h3>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Account Created</p>
                    <p className="font-medium text-gray-900">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                    <p className="font-medium text-gray-900">{orderStats.total}</p>
                  </div>

                  {orderStats.total > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-2">Order Status</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Pending</span>
                          <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            {orderStats.pending}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Shipped</span>
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {orderStats.shipped}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Delivered</span>
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            {orderStats.delivered}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;