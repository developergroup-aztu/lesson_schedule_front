import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

const usePermissions = (requiredPermissions: string | string[]) => {
  const context = useContext(AuthContext);

  if (!context || !context.user) {
    return false;
  }

  const { user } = context;

  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.every(permission => user.permissions.includes(permission));
  }

  return user.permissions.includes(requiredPermissions);
};

export default usePermissions;