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

  // Unauthorized vəziyyətində istifadəçini yönləndirir
  const handleUnauthorized = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/signin', { replace: true });
  };

  // Profil məlumatlarını çəkir
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

  // İlk dəfə komponent yüklənəndə tokeni yoxlayır
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // İstifadəçi daxil olduqda işləyir
  const login = async (token: string) => {
    try {
      // Tokeni yadda saxla
      localStorage.setItem('token', token);

      // Profil məlumatlarını çək
      const profileData = await getProfile();
      const userData = profileData.data.userData;

      // İstifadəçi məlumatlarını state-ə yaz
      setUser({
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        roles: userData.roles,
        permissions: userData.permissions,
        faculty_id: userData.faculty_id,
        faculty_name: userData.faculty_name,
      });

      // İstifadəçini autentifikasiya olunmuş kimi işarələ
      setIsAuthenticated(true);

      // Dashboard-a yönləndir
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Error during login:', error);

      // Əgər xətalı cavab varsa, tokeni sil
      localStorage.removeItem('token');
      setIsAuthenticated(false);

      // Əgər 401 xətası varsa, istifadəçini signin səhifəsinə yönləndir
      if (error.response && error.response.status === 401) {
        handleUnauthorized();
      }
    }
  };

  // İstifadəçini çıxış etdirir
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