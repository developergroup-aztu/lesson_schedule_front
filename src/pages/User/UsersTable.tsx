import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del } from '../../api/service';
import useProfile from '../../hooks/useProfile';
import usePermissions from '../../hooks/usePermissions';
import DeleteModal from '../../components/Modals/Role/DeleteRoleModal';
import { ClipLoader } from 'react-spinners';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import { PiEyeLight } from 'react-icons/pi';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const profile = useProfile();
  const hasDeletePermission = usePermissions('delete_user');
  const hasEditPermission = usePermissions('edit_user');
  const hasAddPermission = usePermissions('add_user');
  const hasViewPermission = usePermissions('view_user');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await get('/api/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); // Veri yüklendikten sonra loading state'ini false yap
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await get('/api/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    if (profile) {
      fetchUsers();
      fetchRoles();
    }
  }, [profile]);

  useEffect(() => {
    const results = users.filter(
      (user) =>
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedRole === '' || Object.keys(user.roles).includes(selectedRole)),
    );
    setFilteredUsers(results);
  }, [searchTerm, selectedRole, users]);

  const handleEdit = (id: number) => {
    navigate(`/user/edit/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/user/view/${id}`);
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await del(`/api/users/${selectedUser.id}`);
        setUsers(users.filter((user) => user.id !== selectedUser.id));
        closeModal();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
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
    navigate('/user/add');
  };

  if (!profile) {
    return <div>Yüklənir...</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Breadcrumb pageName="İstifadəçilər" />

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-2/4">
          <input
            type="text"
            placeholder="Ad və ya emailə görə axtarın"
            className="px-4 w-full sm:w-2/3 py-2 border dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.trim())}
          />
          <select
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Bütün rollar</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        {hasAddPermission && (
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
            onClick={handleAddNewUser}
          >
            Yeni İstifadəçi Əlavə Et
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#e3e3e3] dark:bg-gray-800">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Roles</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-100 dark:bg-gray-700 transition-all duration-300 ease-linear"
              >
                <td className="py-2 px-4 border-b text-center">{user.name}</td>
                <td className="py-2 px-4 border-b text-center">{user.email}</td>
                <td className="py-2 px-4 border-b text-center">
                  {Object.keys(user.roles).join(', ')}
                </td>
                <td className="py-2 px-4 border-b flex justify-center">
                  {hasViewPermission && (
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg mr-2 transition-colors duration-200"
                      onClick={() => handleView(user.id)}
                    >
                      <PiEyeLight className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                  {hasEditPermission && (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg mr-2 transition-colors duration-200"
                      onClick={() => handleEdit(user.id)}
                    >
                      <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                  {hasDeletePermission && (
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200"
                      onClick={() => openModal(user)}
                    >
                      <AiOutlineDelete className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 truncate">{user.email}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {hasViewPermission && (
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded-lg transition-colors duration-200"
                    onClick={() => handleView(user.id)}
                  >
                    <PiEyeLight className="w-4 h-4" />
                  </button>
                )}
                {hasEditPermission && (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-colors duration-200"
                    onClick={() => handleEdit(user.id)}
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                )}
                {hasDeletePermission && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors duration-200"
                    onClick={() => openModal(user)}
                  >
                    <AiOutlineDelete className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Rollar:</span> {Object.keys(user.roles).join(', ')}
            </div>
          </div>
        ))}
      </div>

      <DeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UserTable;