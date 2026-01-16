import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import usePermissions from '../hooks/usePermissions';
import Forbidden from '../pages/Common/403';
import Loader from '../common/Loader'; // Loader komponentinizin yolunu dəqiqləşdirin

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { isAuthenticated, isLoading } = useAuth(); // 👈 isLoading-u alırıq
  const hasPermission = requiredPermission ? usePermissions(requiredPermission) : true;

  // 1. Yüklənmə vəziyyəti: Autentifikasiyanın yoxlanılmasını gözləyirik
  if (isLoading) {
    // Loader komponenti hələ yoxdursa, müvəqqəti olaraq null və ya sadə bir mətn qaytara bilərsiniz.
    return <Loader />; 
  }

  // 2. Autentifikasiya yoxlanışı
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // 3. İcazə yoxlanışı (Əgər tələb olunursa)
  if (!hasPermission) {
    return <Forbidden />;
  }

  // Hər şey qaydasındadırsa, uşaq komponenti göstəririk
  return children;
};

export default ProtectedRoute;