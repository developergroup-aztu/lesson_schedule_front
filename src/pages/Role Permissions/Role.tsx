import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del } from '../../api/service';
import DeleteModal from '../../components/Modals/Role/DeleteRoleModal';
import PermissionsModal from '../../components/Modals/Permissions/RolePermissionModal';
import usePermissions from '../../hooks/usePermissions';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegEdit } from 'react-icons/fa';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners'; // react-spinners'dan ClipLoader'ı ekleyin
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

const RoleTable: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Yükleme durumunu ekleyin
  const navigate = useNavigate();
  const hasDeleteRole = usePermissions('delete_role');
  const hasEditRole = usePermissions('edit_role');
  const hasAddRole = usePermissions('add_role');
  const hasViewRole = usePermissions('view_role');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true); // Yükleme durumunu true olarak ayarlayın
        const response = await get('/api/roles');
        setRoles(response.data);
        setLoading(false); // Yükleme durumunu false olarak ayarlayın
      } catch (err: any) {
        console.error('Error fetching roles:', err);
        setError(err.message || 'An error occurred');
        setLoading(false); // Yükleme durumunu false olarak ayarlayın
      }
    };

    fetchRoles();
  }, []);

    if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  const handleDeleteRole = async () => {
    if (selectedRole) {
      try {
        await del(`/api/roles/${selectedRole.id}`);
        setRoles(roles.filter((role) => role.id !== selectedRole.id));
        setIsDeleteModalOpen(false);
      } catch (err: any) {
        console.error('Error deleting role:', err);
        setError(err.message || 'An error occurred');
      }
    }
  };

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };


  return (
    <div className="">
      <Breadcrumb pageName="Rollar" />

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {hasAddRole && (
        <div className="mb-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={() => navigate('/role/add')}
          >
            Yeni Rol Əlavə Et
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#e3e3e3] dark:bg-gray-800">
              <th className="py-2 px-4 border-b">Rol</th>
              <th className="py-2 px-4 border-b">İcazələr</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-gray-100 dark:bg-gray-700 transition-all duration-300 ease-linear"
              >
                <td className="py-2 px-4 border-b text-center">{role.name}</td>
                <td className="py-2 px-4 border-b text-center">
                  {role.permissions.length} İcazə
                </td>
                <td className="py-2 px-4 border-b text-center">
                {hasViewRole && (
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg mr-2 transition-colors duration-200"
                      onClick={() => openPermissionsModal(role)}
                    >
                      <PiEyeLight className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                  {hasEditRole && (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg mr-2 transition-colors duration-200"
                      onClick={() => navigate(`/role/edit/${role.id}`)}
                    >
                      <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                  {hasDeleteRole && (
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white p-2 mr-2 rounded-lg transition-colors duration-200"
                      onClick={() => openDeleteModal(role)}
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
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">{role.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {role.permissions.length} İcazə
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {hasEditRole && (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-colors duration-200"
                    onClick={() => navigate(`/role/edit/${role.id}`)}
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                )}
                {hasDeleteRole && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors duration-200"
                    onClick={() => openDeleteModal(role)}
                  >
                    <AiOutlineDelete className="w-4 h-4" />
                  </button>
                )}
                {hasViewRole && (
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded-lg transition-colors duration-200"
                    onClick={() => openPermissionsModal(role)}
                  >
                    <PiEyeLight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRole}
      />

      {selectedRole && (
        <PermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          role={selectedRole}
        />
      )}
    </div>
  );
};

export default RoleTable;



