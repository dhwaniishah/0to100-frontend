import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (isAuthenticated) {
    return <Navigate to="/shop" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute, PublicOnlyRoute };