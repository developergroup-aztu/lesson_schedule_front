import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, put } from '../../api/service';
import usePermissions from '../../hooks/usePermissions';
import useSweetAlert from '../../hooks/useSweetAlert';

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
  const [patronymic, setPatronymic] = useState('');
  const [duty, setDuty] = useState('');
  const [employeeType, setEmployeeType] = useState('');
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
        setPatronymic(userData.patronymic || '');
        setDuty(userData.duty || '');
        setEmployeeType(userData.employee_type || '');
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
      errorAlert('Xəta', 'Admin və ya SuperAdmin heçbir fakültəyə əlavə oluna bilməz.');
      setIsLoading(false);
      return;
    }

    if (selectedRole?.name === 'FacultyAdmin' && !facultyId) {
      errorAlert('Xəta', 'FacultyAdmin yalnız bir fakültəyə əlavə olunmalıdır.');
      setIsLoading(false);
      return;
    }

    if (selectedRole?.name === 'teacher' && !facultyId) {
      errorAlert('Xəta', 'Teacher bir fakültəyə əlavə olunmalıdır.');
      setIsLoading(false);
      return;
    }

    try {
      let payload: any = {
        name,
        surname,
        patronymic,
        duty,
        employee_type: employeeType,
        email,
        role_id: roleId,
      };

      if (roleId !== 3) { // Əgər admin deyilsə
        payload.faculty_id = facultyId;
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
    <div className="">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">İstifadəçini Redaktə Et</h2>
        </div>
        <div className="p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Şəxsi Məlumatlar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all outline-none duration-200"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınızı daxil edin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all outline-none duration-200"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Soyadınızı daxil edin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ata adı *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all outline-none duration-200"
                    value={patronymic}
                    onChange={(e) => setPatronymic(e.target.value)}
                    placeholder="Ata adınızı daxil edin"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Peşəkar Məlumatlar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vəzifə *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all outline-none duration-200"
                    value={duty}
                    onChange={(e) => setDuty(e.target.value)}
                    placeholder="Vəzifənizi daxil edin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İşçi növü *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all outline-none duration-200"
                    value={employeeType}
                    onChange={(e) => setEmployeeType(e.target.value)}
                    placeholder="İşçi növünü daxil edin"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role and Faculty Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Rol və Fakültə
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all outline-none duration-200"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fakültə
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all outline-none duration-200"
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Admin və SuperAdmin üçün fakültə seçimi tələb olunmur
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Hesab Məlumatları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all outline-none duration-200"
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
                className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-medium transition-all duration-200 ${!isLoading
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
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
                className="flex-1 sm:flex-none px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                onClick={() => navigate('/users')}
              >
                Ləğv et
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;