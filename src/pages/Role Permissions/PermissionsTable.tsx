import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../../api/service';
import AddPermissionModal from '../../components/Modals/Permissions/AddPermission';
import EditPermissionModal from '../../components/Modals/Permissions/EditPermissionModal';
import DeleteModal from '../../components/Modals/Role/DeleteRoleModal';
import usePermissions from '../../hooks/usePermissions';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegEdit } from 'react-icons/fa';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { ClipLoader } from 'react-spinners';

interface Permission {
  id: number;
  name: string;
}

const PermissionsTable: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    [],
  );
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hasAddPermission = usePermissions('add_permission');
  const hasEditPermission = usePermissions('edit_permission');
  const hasDeletePermission = usePermissions('delete_permission');
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      const response = await get('/api/permissions');
      setPermissions(response.data);
      setFilteredPermissions(response.data);
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
      setError(err.message || 'An error occurred');
    }
    finally {
      setLoading(false); // Veri yüklendikten sonra loading state'ini false yap
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  

  useEffect(() => {
    setFilteredPermissions(
      permissions.filter((permission) =>
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [searchQuery, permissions]);

  const handleAddPermission = async (name: string) => {
    try {
      await post('/api/permissions', { name });
      setIsAddModalOpen(false);
      fetchPermissions();
    } catch (err: any) {
      console.error('Error adding permission:', err);
      setError(err.message || 'An error occurred');
    }
  };

  const handleEditPermission = async (id: number, name: string) => {
    try {
      await put(`/api/permissions/${id}`, { name });
      setIsEditModalOpen(false);
      fetchPermissions();
    } catch (err: any) {
      console.error('Error editing permission:', err);
      setError(err.message || 'An error occurred');
    }
  };

  const handleDeletePermission = async () => {
    if (selectedPermission) {
      try {
        await del(`/api/permissions/${selectedPermission.id}`);
        setPermissions(
          permissions.filter(
            (permission) => permission.id !== selectedPermission.id,
          ),
        );
        setIsDeleteModalOpen(false);
        fetchPermissions();
      } catch (err: any) {
        console.error('Error deleting permission:', err);
        setError(err.message || 'An error occurred');
      }
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  return (
    <div className="">
      <Breadcrumb pageName="İcazələr" />

      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="İcazələri axtarın..."
          className="w-full md:w-2/4 px-4 py-2 border dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {hasAddPermission && (
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
            onClick={openAddModal}
          >
            Yeni İcazə Əlavə Et
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#e3e3e3] dark:bg-gray-800">
              <th className="py-2 px-4 border-b">İcazə</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPermissions.map((permission) => (
              <tr
                key={permission.id}
                className="hover:bg-gray-100 dark:bg-gray-700 transition-all duration-300 ease-linear"
              >
                <td className="py-2 px-4 border-b text-center">
                  {permission.name}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {hasEditPermission && (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg mr-2 transition-colors duration-200"
                      onClick={() => openEditModal(permission)}
                    >
                      <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                  {hasDeletePermission && (
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200"
                      onClick={() => openDeleteModal(permission)}
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
        {filteredPermissions.map((permission) => (
          <div
            key={permission.id}
            className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">{permission.name}</h3>
              </div>
              <div className="flex gap-2 shrink-0">
                {hasEditPermission && (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-colors duration-200"
                    onClick={() => openEditModal(permission)}
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                )}
                {hasDeletePermission && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors duration-200"
                    onClick={() => openDeleteModal(permission)}
                  >
                    <AiOutlineDelete className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddPermissionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddPermission}
      />

      {selectedPermission && (
        <EditPermissionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onConfirm={(name) =>
            handleEditPermission(selectedPermission.id, name)
          }
          initialName={selectedPermission?.name || ''}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePermission}
      />
    </div>
  );
};

export default PermissionsTable;
