import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getProfile } from '../api/service';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    name: string;
    surname?: string;
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
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{
    name: string;
    surname?: string;
    email: string;
    roles: string[];
    permissions: string[];
    faculty_id?: number;
    faculty_name?: string;
  } | null>(null);
  const navigate = useNavigate();

  const handleUnauthorized = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/signin', { replace: true });
  };

  const fetchProfile = async () => {
    try {
      const profileData = await getProfile();
      const userData = profileData.data.userData;
      setUser({
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        roles: userData.roles,
        permissions: userData.permissions,
        faculty_id: userData.faculty_id,
        faculty_name: userData.faculty_name,
      });
      setIsAuthenticated(true);
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
  }, []);

  const login = async (token: string) => {
    try {
      localStorage.setItem('token', token);

      const profileData = await getProfile();
      const userData = profileData.data.userData;

      setUser({
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        roles: userData.roles,
        permissions: userData.permissions,
        faculty_id: userData.faculty_id,
        faculty_name: userData.faculty_name,
      });

      setIsAuthenticated(true);

      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Error during login:', error);

      localStorage.removeItem('token');
      setIsAuthenticated(false);

      if (error.response && error.response.status === 401) {
        handleUnauthorized();
      }
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