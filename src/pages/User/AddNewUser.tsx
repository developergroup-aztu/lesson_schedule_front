import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/service';
import useSweetAlert from '../../hooks/useSweetAlert';
import '../../css/Modal.css';

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
  const [patronymic, setPatronymic] = useState('');
  const [duty, setDuty] = useState('');
  const [employeeType, setEmployeeType] = useState('');
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
      await post('/api/users', {
        name,
        surname,
        patronymic,
        duty,
        employee_type: employeeType,
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
    return name && surname && patronymic && duty && employeeType && email && password && roleId;
  };

  return (
    <div className="">
      <div className=" mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Yeni İstifadəçi Əlavə Et</h2>
          </div>
          
          <div className="p-6 sm:p-8">
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleAddUser(); }}>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fakültə
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Şifrə *
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
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
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isFormValid() && !isLoading
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  }`}
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
    </div>
  );
};

export default AddNewUser;