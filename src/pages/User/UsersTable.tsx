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

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '');
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
      } catch {
        // ignore
      }
    };

    if (profile) {
      fetchUsers();
      fetchRoles();
    }
  }, [profile]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedRole) params.set('role', selectedRole);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedRole, setSearchParams]);

  useEffect(() => {
    const results = users.filter(
      (user) =>
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedRole === '' || Object.keys(user.roles).includes(selectedRole)),
    );
    setFilteredUsers(results);
  }, [searchTerm, selectedRole, users]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputSearchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [inputSearchTerm]);

  const handleEdit = (id: number) => {
    const currentParams = searchParams.toString();
    navigate(`/users/edit/${id}?returnTo=${encodeURIComponent(`/users?${currentParams}`)}`);
  };

  const handleView = (id: number) => {
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
    const currentParams = searchParams.toString();
    navigate(`/users/add?returnTo=${encodeURIComponent(`/users?${currentParams}`)}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputSearchTerm(e.target.value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
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
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader size={40} color="#6366f1" />
          <span className="text-gray-600 font-medium">İstifadəçilər yüklənir...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <Breadcrumb pageName="İstifadəçilər" />
        {hasAddPermission && (
         <div className='flex justify-end mb-4'>
           <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            onClick={handleAddNewUser}
          >
            <FaUserPlus className="w-4 h-4" />
            Yeni İstifadəçi
          </button>
         </div>
        )}

      {/* Search & Filter */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ad və ya emailə görə axtarın..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-gray-700"
                value={inputSearchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="relative min-w-[180px]">
              <HiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-gray-700"
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
      </div>

      {/* Desktop Table View */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto hidden lg:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Ad</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Email</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Rollar</th>
              <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">İstifadəçi tapılmadı</td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-6 border-b">{idx + 1}</td>
                  <td className="py-3 px-6 border-b">{user.name}</td>
                  <td className="py-3 px-6 border-b">{user.email}</td>
                  <td className="py-3 px-6 border-b">
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(user.roles).map((role) => (
                        <span
                          key={role}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-6 border-b text-center">
                    <div className="flex justify-center gap-1">
                      {hasViewPermission && (
                        <button
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded transition-colors"
                          onClick={() => handleView(user.id)}
                          title="Bax"
                        >
                          <PiEyeLight className="w-5 h-5" />
                        </button>
                      )}
                      {hasEditPermission && (
                        <button
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-1.5 rounded transition-colors"
                          onClick={() => handleEdit(user.id)}
                          title="Redaktə et"
                        >
                          <FaRegEdit className="w-4 h-4" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded transition-colors"
                          onClick={() => handleDelete(user)}
                          title="Sil"
                        >
                          <AiOutlineDelete className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.map((user, idx) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-gray-600 truncate text-sm">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {hasViewPermission && (
                  <button
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded transition-colors"
                    onClick={() => handleView(user.id)}
                  >
                    <PiEyeLight className="w-4 h-4" />
                  </button>
                )}
                {hasEditPermission && (
                  <button
                    className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-1.5 rounded transition-colors"
                    onClick={() => handleEdit(user.id)}
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                )}
                {hasDeletePermission && (
                  <button
                    className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded transition-colors"
                    onClick={() => openModal(user)}
                  >
                    <AiOutlineDelete className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Rollar:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(user.roles).map((role) => (
                  <span
                    key={role}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
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
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Heç bir istifadəçi tapılmadı
          </h3>
          <p className="text-gray-500">
            Axtarış kriteriyalarınızı dəyişərək yenidən cəhd edin
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTable;