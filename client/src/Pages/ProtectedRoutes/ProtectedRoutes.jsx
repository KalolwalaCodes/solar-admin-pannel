// ProtectedRoutes.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // Otherwise, allow them to access the protected route
  return children;
};

export default ProtectedRoute;
