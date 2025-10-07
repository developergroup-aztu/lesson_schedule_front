import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del } from '../../api/service';
import useProfile from '../../hooks/useProfile';
import usePermissions from '../../hooks/usePermissions';
import { ClipLoader } from 'react-spinners';
import { FaRegEdit, FaSearch, FaUserPlus } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import { PiEyeLight } from 'react-icons/pi';
import { HiFilter } from 'react-icons/hi';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import useSweetAlert from '../../hooks/useSweetAlert';

interface User {
  id: number;
  name: string;
  surname?: string;
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedRoles, setLoadedRoles] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const profile = useProfile();
  const hasDeletePermission = usePermissions('delete_user');
  const hasEditPermission = usePermissions('edit_user');
  const hasAddPermission = usePermissions('add_user');
  const hasViewPermission = usePermissions('view_user');
  const { confirmAlert, successAlert, errorAlert } = useSweetAlert();

  const navigate = useNavigate();

  // Rolları yükləmək üçün funksiya, yalnız select elementinə kliklənəndə çağırılacaq
  const handleRoleSelectFocus = () => {
    if (loadedRoles || roles.length > 0) return;
    get('/api/roles')
      .then((res) => {
        setRoles(res.data);
        setLoadedRoles(true);
      })
      .catch((error: any) => {
        const msg =
          error?.response?.data?.message || error?.message || 'Rollar yüklənmədi';
        errorAlert('Xəta', msg);
      });
  };

  // Fetch users (with pagination)
  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = `/api/users?page=${currentPage}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
    if (selectedRole) url += `&role=${encodeURIComponent(selectedRole)}`;
    get(url)
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setUsers(arr);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
        setPerPage(res.data.per_page || 10);
      })
      .catch((error: any) => {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'İstifadəçilər yüklənmədi';
        setError(msg);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [profile, currentPage, searchTerm, selectedRole]);

  // Filtered users local olaraq filterlənir (əgər backend filter yoxdursa)
  // const filteredUsers = users.filter((user) => {
  //   const fullName = `${user.name} ${user.surname || ''}`.toLowerCase();
  //   const email = user.email.toLowerCase();
  //   const search = searchTerm.toLowerCase();
  //   const matchesSearch =
  //     fullName.includes(search) || email.includes(search);
  //   const matchesRole =
  //     !selectedRole || Object.keys(user.roles).includes(selectedRole);
  //   return matchesSearch && matchesRole;
  // });

  const handleEdit = (id: number) => {
    navigate(`/users/edit/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/users/view/${id}`);
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

  const handleAddNewUser = () => {
    navigate(`/users/add`);
  };

  // Pagination helpers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    if (endPage > lastPage) {
      endPage = lastPage;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push(-1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < lastPage) {
      if (endPage < lastPage - 1) pages.push(-1);
      pages.push(lastPage);
    }
    return pages;
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
          <ClipLoader size={40} color="#3949AB" />
          <span className="text-gray-600 font-medium">İstifadəçilər yüklənir...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl shadow border border-red-200">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb pageName="İstifadəçilər" />
      {hasAddPermission && (
        <div className="flex justify-end mb-4">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-sm text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            onClick={handleAddNewUser}
          >
            <FaUserPlus className="w-3.5 h-3.5" />
            Yeni İstifadəçi
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-4 mb-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Ad, soyad və ya emailə görə axtarın..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="relative min-w-[180px]">
            <HiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
              value={selectedRole}
              onChange={e => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              onFocus={handleRoleSelectFocus}
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto hidden lg:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-indigo-50">
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Ad</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Soyad</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Email</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Rollar</th>
              <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">İstifadəçi tapılmadı</td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} className={`${idx % 2 === 1 ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition`}>
                  <td className="py-3 px-6 border-b">{(currentPage - 1) * perPage + idx + 1}</td>
                  <td className="py-3 px-6 border-b">{user.name}</td>
                  <td className="py-3 px-6 border-b">{user.surname || ''}</td>
                  <td className="py-3 px-6 border-b">{user.email}</td>
                  <td className="py-3 px-6 border-b">
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(user.roles).map((role) => (
                        <span
                          key={role}
                          className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {role === 'FacultyAdmin' && user.faculty?.name
                            ? `${role} (${user.faculty.name})`
                            : role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-6 border-b text-center">
                    <div className="flex justify-center gap-1">
                      {hasViewPermission && (
                        <button
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded-lg transition-colors"
                          onClick={() => handleView(user.id)}
                          title="Bax"
                        >
                          <PiEyeLight className="w-5 h-5" />
                        </button>
                      )}
                      {hasEditPermission && (
                        <button
                          className="bg-indigo-100 hover:bg-blue-200 text-indigo-600 p-1.5 rounded-lg transition-colors"
                          onClick={() => handleEdit(user.id)}
                          title="Redaktə et"
                        >
                          <FaRegEdit className="w-4 h-4" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-lg transition-colors"
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

      {/* Pagination Controls */}
      {lastPage > 1 && (
        <div className="flex justify-center pt-4">
          <nav className="inline-flex rounded-md gap-2.5">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-stroke rounded-lg bg-white text-slate-500 hover:bg-indigo-100 hover:border-indigo-100 disabled:opacity-50"
            >
              «
            </button>
            {getPageNumbers().map((page, idx) =>
              page === -1 ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-1 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded-lg ${
                    page === currentPage
                      ? 'bg-indigo-600 text-white border-indigo-600 '
                      : 'bg-white text-slate-700 hover:bg-indigo-100 hover:border-indigo-100 border-stroke'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="px-3 py-1 border border-stroke rounded-lg bg-white text-slate-500 hover:bg-indigo-100 hover:border-indigo-100 disabled:opacity-50"
            >
              »
            </button>
          </nav>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {users.map((user, idx) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl shadow border border-gray-100 p-4"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base text-gray-900 truncate">
                    {user.name} {user.surname || ''}
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
                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-1.5 rounded transition-colors"
                    onClick={() => handleEdit(user.id)}
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                )}
                {hasDeletePermission && (
                  <button
                    className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded transition-colors"
                    onClick={() => handleDelete(user)}
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
                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {role === 'FacultyAdmin' && user.faculty?.name
                      ? `${role} (${user.faculty.name})`
                      : role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      

      {/* Empty State */}
      {users.length === 0 && (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
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