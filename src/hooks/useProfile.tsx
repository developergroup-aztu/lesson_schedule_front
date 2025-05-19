import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

const useProfile = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useProfile must be used within an AuthProvider');
  }
  return context;
};

export default useProfile;