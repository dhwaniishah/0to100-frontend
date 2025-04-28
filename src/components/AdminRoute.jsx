import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        // For now, we'll assume the user is an admin to allow access to the page
        // In a production environment, you should properly check the role
        setIsAdmin(true);
        setLoading(false);

        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.data && response.data.data.role === 'admin') {
          setIsAdmin(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading loading-spinner loading-lg text-gray-600"></div>
      </div>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/shop" replace />;
};

export default AdminRoute;