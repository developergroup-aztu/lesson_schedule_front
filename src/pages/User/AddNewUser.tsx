import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/service';
import useSweetAlert from '../../hooks/useSweetAlert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

interface Faculty {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

const AddNewUser: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { errorAlert, successAlert } = useSweetAlert();

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await get('/api/faculties');
        setFaculties(response.data);
      } catch (err: any) {
        errorAlert('Xəta', err.message || 'Fakültələr yüklənmədi');
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await get('/api/roles');
        setAllRoles(response.data);
      } catch (err: any) {
        errorAlert('Xəta', err.message || 'Rollar yüklənmədi');
      }
    };

    fetchFaculties();
    fetchRoles();
    // eslint-disable-next-line
  }, []);

  const handleAddUser = async () => {
    setIsLoading(true);
    const selectedRole = allRoles.find(role => role.id === roleId);

    if ((selectedRole?.name === 'admin' || selectedRole?.name === 'SuperAdmin') && facultyId) {
      errorAlert('Xəta', 'Admin və ya SuperAdmin heç bir fakültəyə əlavə oluna bilməz.');
      setIsLoading(false);
      return;
    }

    if (selectedRole?.name === 'FacultyAdmin' && !facultyId) {
      errorAlert('Xəta', 'FacultyAdmin yalnız bir fakültəyə əlavə olunmalıdır.');
      setIsLoading(false);
      return;
    }

    if (selectedRole?.name === 'teacher' && !facultyId) {
      errorAlert('Xəta', 'Müəllim bir fakültəyə əlavə olunmalıdır.');
      setIsLoading(false);
      return;
    }

    try {
      await post('/api/users', {
        name,
        surname,
        faculty_id: facultyId,
        email,
        password,
        role_id: roleId,
      });
      successAlert('Uğurlu', 'İstifadəçi əlavə olundu.');
      navigate('/users');
    } catch (err: any) {
      errorAlert('Xəta', err.message || 'İstifadəçi əlavə olunmadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoleId = Number(e.target.value);
    setRoleId(newRoleId);

    const selectedRole = allRoles.find(role => role.id === newRoleId);

    if (selectedRole?.name === 'admin' || selectedRole?.name === 'SuperAdmin') {
      setFacultyId(null);
    }
  };

  const isFormValid = () => {
    return name && surname && email && password && roleId;
  };

  return (
    <div className="space-y-6">
      <Breadcrumb pageName="Yeni İstifadəçi Əlavə Et" />
      <div className="mx-auto">
        <div className="bg-white shadow rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Yeni İstifadəçi Əlavə Et</h2>
          </div>
          <div className="p-6 sm:p-8">
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleAddUser(); }}>
              {/* Personal Information Section */}
              <div className="border-b border-gray-100 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Şəxsi Məlumatlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adınızı daxil edin"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      placeholder="Soyadınızı daxil edin"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Role and Faculty Section */}
              <div className="border-b border-gray-100 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Rol və Fakültə
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                      value={roleId || ''}
                      onChange={handleRoleChange}
                      required
                    >
                      <option value="">Rol seçin</option>
                      {allRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fakültə
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                      value={facultyId || ''}
                      onChange={(e) => setFacultyId(Number(e.target.value) || null)}
                      disabled={allRoles.find(role => role.id === roleId)?.name === 'admin' ||
                                allRoles.find(role => role.id === roleId)?.name === 'SuperAdmin'}
                    >
                      <option value="">Fakültə seçin</option>
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                    {(allRoles.find(role => role.id === roleId)?.name === 'admin' ||
                      allRoles.find(role => role.id === roleId)?.name === 'SuperAdmin') && (
                      <p className="text-sm text-gray-500 mt-1">
                        Admin və SuperAdmin üçün fakültə seçimi tələb olunmur
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Hesab Məlumatları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifrə *
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifrənizi daxil edin"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-md font-medium transition-all duration-200 ${
                    isFormValid() && !isLoading
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Əlavə edilir...
                    </div>
                  ) : (
                    'İstifadəçi Əlavə Et'
                  )}
                </button>
                <button
                  type="button"
                  className="flex-1 sm:flex-none px-8 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-all duration-200"
                  onClick={() => navigate('/users')}
                >
                  Ləğv et
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewUser;