import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, put } from '../../api/service';
import usePermissions from '../../hooks/usePermissions';
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

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasEditPermission = usePermissions('edit_user');
  const { errorAlert, successAlert } = useSweetAlert();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await get(`/api/users/${id}`);
        const userData = response.data;
        setName(userData.name || '');
        setSurname(userData.surname || '');
        setFacultyId(userData.faculty?.id || null);
        setEmail(userData.email || '');
        setRoleId(Array.isArray(userData.roles)
          ? userData.roles[0]
          : Object.values(userData.roles)[0] || null);
      } catch (err: any) {
        errorAlert('Xəta', err.message || 'İstifadəçi məlumatı yüklənmədi');
      }
    };

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

    fetchUser();
    fetchFaculties();
    fetchRoles();
    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      let payload: any = {
        name,
        surname,
        email,
        role_id: roleId,
      };

      if (selectedRole?.name !== 'admin' && selectedRole?.name !== 'SuperAdmin') {
        payload.faculty_id = facultyId;
      } else {
        payload.faculty_id = null;
      }

      await put(`/api/users/${id}`, payload);
      successAlert('Uğurlu', 'İstifadəçi yeniləndi.');
      navigate('/users');
    } catch (err: any) {
      errorAlert('Xəta', err.message || 'İstifadəçi yenilənmədi');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasEditPermission) {
    return <div>İcazəniz yoxdur</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb pageName="İstifadəçini Redaktə Et" />
      <div className="mx-auto">
        <div className="bg-white shadow rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">İstifadəçini Redaktə Et</h2>
          </div>
          <div className="p-6 sm:p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                      onChange={(e) => {
                        setRoleId(Number(e.target.value));
                        const selectedRole = allRoles.find(role => role.id === Number(e.target.value));
                        if (selectedRole?.name === 'admin' || selectedRole?.name === 'SuperAdmin') {
                          setFacultyId(null);
                        }
                      }}
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-md font-medium transition-all duration-200 ${
                    !isLoading
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Yenilənir...
                    </div>
                  ) : (
                    'Yenilə'
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

export default EditUser;