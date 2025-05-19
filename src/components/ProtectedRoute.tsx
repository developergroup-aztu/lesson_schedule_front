import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import usePermissions from '../hooks/usePermissions';
import Forbidden from '../pages/Common/Forbidden';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { isAuthenticated } = useAuth();
  const hasPermission = requiredPermission ? usePermissions(requiredPermission) : true;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (!hasPermission) {
    // Instead of redirecting, render the Forbidden component inline
    return <Forbidden />;
  }

  return children;
};

export default ProtectedRoute;