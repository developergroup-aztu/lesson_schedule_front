import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { post } from '../../api/service';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;
  const otp = location.state?.otp;

  // Frontend validasiya funksiyası
  const validatePasswords = (): string | null => {
    if (!password || !confirmPassword) {
      return 'Bütün sahələr doldurulmalıdır';
    }
    
    if (password.length < 6) {
      return 'Şifrə ən azı 6 simvol olmalıdır';
    }
    
    if (password !== confirmPassword) {
      return 'Şifrələr uyğun deyil';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Frontend validasiya
    const validationError = validatePasswords();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!email || !otp) {
      setError('Zəruri məlumatlar çatışmır. Yenidən cəhd edin.');
      return;
    }

    setIsLoading(true);

    try {
      // Backend-ə new_password_confirmation ilə göndəririk
      await post('/api/reset-password', { 
        email, 
        otp, 
        new_password: password,
        new_password_confirmation: confirmPassword
      });
      
      setMessage('Şifrə uğurla yeniləndi');
      
      // 2 saniyə sonra signin səhifəsinə yönləndir
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Naməlum xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Şifrəni Yenilə
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Yeni şifrənizi daxil edin
          </p>
        </div>

        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-center">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Yeni Şifrə
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Yeni şifrənizi daxil edin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Şifrəni Təsdiqlə
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Şifrənizi təsdiqləyin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yenilənir...
                </span>
              ) : (
                'Şifrəni Yenilə'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;