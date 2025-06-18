import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, del } from '../../api/service';
import useProfile from '../../hooks/useProfile';
import usePermissions from '../../hooks/usePermissions';
import { ClipLoader } from 'react-spinners';
import { FaRegEdit, FaSearch, FaUserPlus } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import { PiEyeLight } from 'react-icons/pi';
import { HiFilter } from 'react-icons/hi';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import useSweetAlert from '../../hooks/useSweetAlert';

interface User {
  id: number;
  name: string;
  email: string;
  roles: { [key: string]: number };
  faculty?: { id: number; name: string };
  department_names?: { [key: string]: number };
}

interface Role {
  id: number;
  name: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL search params istifadə edirik
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '');

  // Axtarış üçün yeni state əlavə edirik, bu state birbaşa inputa bağlı olacaq
  const [inputSearchTerm, setInputSearchTerm] = useState(searchTerm);

  const profile = useProfile();
  const hasDeletePermission = usePermissions('delete_user');
  const hasEditPermission = usePermissions('edit_user');
  const hasAddPermission = usePermissions('add_user');
  const hasViewPermission = usePermissions('view_user');
  const { confirmAlert, successAlert, errorAlert } = useSweetAlert();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await get('/api/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error: any) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'İstifadəçilər yüklənmədi';
        setError(msg);
        Swal.fire({
          icon: 'error',
          title: 'Xəta',
          text: msg,
          confirmButtonColor: '#2563eb',
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await get('/api/roles');
        setRoles(response.data);
      } catch (error) {
        // Roles üçün error göstərməyə ehtiyac yoxdur
      }
    };

    if (profile) {
      fetchUsers();
      fetchRoles();
    }
  }, [profile]);

  // Search və filter dəyişikliklərini URL-ə yazırıq
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedRole) params.set('role', selectedRole);

    // URL-ni yeniləyirik
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedRole, setSearchParams]);

  // Filtering logic
  useEffect(() => {
    const results = users.filter(
      (user) =>
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedRole === '' || Object.keys(user.roles).includes(selectedRole)),
    );
    setFilteredUsers(results);
  }, [searchTerm, selectedRole, users]);

  // inputSearchTerm dəyişdikdə searchTerm-i debounce ilə yenilə
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputSearchTerm.trim());
    }, 300); // 300ms debounce müddəti

    return () => {
      clearTimeout(handler);
    };
  }, [inputSearchTerm]);

  const handleEdit = (id: number) => {
    // Mövcud search parametrlərini saxlayaraq edit səhifəsinə yönləndiririk
    const currentParams = searchParams.toString();
    navigate(`/users/edit/${id}?returnTo=${encodeURIComponent(`/users?${currentParams}`)}`);
  };

  const handleView = (id: number) => {
    // Mövcud search parametrlərini saxlayaraq view səhifəsinə yönləndiririk
    const currentParams = searchParams.toString();
    navigate(`/users/view/${id}?returnTo=${encodeURIComponent(`/users?${currentParams}`)}`);
  };

  const handleDelete = async (user: User) => {
    const confirmed = await confirmAlert(
      'İstifadəçini silmək istədiyinizə əminsiniz?',
      `"${user.name}" istifadəçisi silinəcək.`
    );
    if (!confirmed) return;
    try {
      await del(`/api/users/${user.id}`);
      setUsers(users.filter((u) => u.id !== user.id));
      successAlert('Uğurlu', 'İstifadəçi silindi.');
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'İstifadəçi silinmədi';
      errorAlert('Xəta', msg);
    }
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleAddNewUser = () => {
    // Mövcud search parametrlərini saxlayaraq add səhifəsinə yönləndiririk
    const currentParams = searchParams.toString();
    navigate(`/users/add?returnTo=${encodeURIComponent(`/users?${currentParams}`)}`);
  };

  // Search input dəyişikliyi
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // inputSearchTerm-i birbaşa yeniləyirik
    setInputSearchTerm(e.target.value);
  };

  // Role filter dəyişikliyi
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRole(value);
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-gray-500 dark:text-gray-400 text-lg">
          Yüklənir...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-2xl border border-indigo-100">
          <ClipLoader size={60} color="#6366f1" speedMultiplier={1.2} />
          <span className="text-indigo-700 font-semibold text-lg animate-pulse">
            İstifadəçilər yüklənir...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-lg text-center font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb pageName="İstifadəçilər" />

      {/* Header Card */}
      <div className="relative rounded-2xl shadow-xl overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-95" />
        {/* Optional: əlavə yumşaq işıq effekti */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-300 opacity-30 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-2xl" />
        {/* Content */}
        <div className="relative p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">İstifadəçi İdarəetməsi</h1>
              <p className="text-blue-100">
                Cəmi {filteredUsers.length} istifadəçi tapıldı
              </p>
            </div>
            {hasAddPermission && (
              <button
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={handleAddNewUser}
              >
                <FaUserPlus className="w-5 h-5" />
                Yeni İstifadəçi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Ad və ya emailə görə axtarın..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-700 dark:text-gray-300"
              value={inputSearchTerm} // inputSearchTerm-i istifadə edirik
              onChange={handleSearchChange} // yeni handler
            />
          </div>
          <div className="relative">
            <HiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="pl-12 pr-8 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 min-w-[200px] appearance-none bg-white dark:text-gray-300"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value="">Bütün rollar</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <th className="py-4 px-6 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  İSTİFADƏÇİ
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  EMAIL
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  ROLLAR
                </th>
                <th className="py-4 px-6 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  ƏMƏLIYYATLAR
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                    }`}
                >
                  <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      {user.email}
                    </span>
                  </td>
                  <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(user.roles).map((role) => (
                        <span
                          key={role}
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-center gap-2">
                      {hasViewPermission && (
                        <button
                          className="bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                          onClick={() => handleView(user.id)}
                          title="Bax"
                        >
                          <PiEyeLight className="w-4 h-4" />
                        </button>
                      )}
                      {hasEditPermission && (
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                          onClick={() => handleEdit(user.id)}
                          title="Redaktə et"
                        >
                          <FaRegEdit className="w-4 h-4" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                          onClick={() => handleDelete(user)}
                          title="Sil"
                        >
                          <AiOutlineDelete className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 truncate text-sm">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {hasViewPermission && (
                  <button
                    className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => handleView(user.id)}
                  >
                    <PiEyeLight className="w-4 h-4" />
                  </button>
                )}
                {hasEditPermission && (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => handleEdit(user.id)}
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                )}
                {hasDeletePermission && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => openModal(user)}
                  >
                    <AiOutlineDelete className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rollar:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(user.roles).map((role) => (
                  <span
                    key={role}
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Heç bir istifadəçi tapılmadı
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Axtarış kriteriyalarınızı dəyişərək yenidən cəhd edin
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTable;