import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del } from '../api/service';
import DeleteModal from '../components/Modals/Role/DeleteRoleModal';
import PermissionsModal from '../components/Modals/Permissions/RolePermissionModal';
import usePermissions from '../hooks/usePermissions';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegEdit } from 'react-icons/fa';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners'; // react-spinners'dan ClipLoader'ı ekleyin
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

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
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
            onClick={() => navigate('/add-role')}
          >
            Yeni Rol Əlavə Et
          </button>
        </div>
      )}
     
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
                  {hasEditRole && (
                    <button
                      className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                      onClick={() => navigate(`/edit-role/${role.id}`)}
                    >
                      <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                  {hasDeleteRole && (
                    <button
                      className="bg-red-500 text-white p-2 mr-2 rounded-lg"
                      onClick={() => openDeleteModal(role)}
                    >
                      <AiOutlineDelete className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                  {hasViewRole && (
                    <button
                      className="bg-[#d29a00] text-white p-2 rounded-lg mr-2"
                      onClick={() => openPermissionsModal(role)}
                    >
                      <PiEyeLight className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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

