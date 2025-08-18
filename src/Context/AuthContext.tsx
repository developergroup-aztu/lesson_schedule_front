import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getProfile } from '../api/service';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    faculty_id?: number;
    faculty_name?: string;
  } | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    faculty_id?: number;
    faculty_name?: string;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProfile = async () => {
    try {
      const profileData = await getProfile();
      const userData = profileData.data.userData;
      setUser({
        name: userData.name,
        email: userData.email,
        roles: userData.roles,
        permissions: userData.permissions,
        faculty_id: userData.faculty_id,
        faculty_name: userData.faculty_name,
      });
      setIsAuthenticated(true);

      // Əgər FacultyAdmin rolundadırsa və route "/"-dursa, schedules-ə yönləndir
      if (
        userData.roles?.includes('FacultyAdmin') &&
        location.pathname === '/dashboard'
      ) {
        navigate('/schedules', { replace: true });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setIsAuthenticated(false);
    }
    // eslint-disable-next-line
  }, []);

const login = async (token: string) => {
  localStorage.setItem('token', token);
  const profileData = await getProfile();
  const userData = profileData.data.userData;
  setUser({
    name: userData.name,
    email: userData.email,
    roles: userData.roles,
    permissions: userData.permissions,
    faculty_id: userData.faculty_id,
    faculty_name: userData.faculty_name,
  });
  setIsAuthenticated(true);

  // FacultyAdmin isə /schedules-ə yönləndir, yoxsa /
  if (userData.roles?.includes('FacultyAdmin')) {
    navigate('/schedules', { replace: true });
  } else {
    navigate('/dashboard', { replace: true });
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};