import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../../api/service';
import AddPermissionModal from '../../components/Modals/Permissions/AddPermission';
import EditPermissionModal from '../../components/Modals/Permissions/EditPermissionModal';
import usePermissions from '../../hooks/usePermissions';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegEdit, FaPlus, FaKey } from 'react-icons/fa';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { ClipLoader } from 'react-spinners';
import useSweetAlert from '../../hooks/useSweetAlert';

interface Permission {
  id: number;
  name: string;
}

const PermissionsTable: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hasAddPermission = usePermissions('add_permission');
  const hasEditPermission = usePermissions('edit_permission');
  const hasDeletePermission = usePermissions('delete_permission');
  const [loading, setLoading] = useState(true);

  const { confirmAlert, successAlert, errorAlert } = useSweetAlert();

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get('/api/permissions');
      setPermissions(response.data);
      setFilteredPermissions(response.data);
    } catch (err: any) {
      setError(err?.message || 'İcazələr yüklənmədi');
      errorAlert('Xəta', err?.message || 'İcazələr yüklənmədi');
    } finally {
      setLoading(false);
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
      successAlert('Uğurlu', 'İcazə əlavə olundu.');
    } catch (err: any) {
      setError(err?.message || 'İcazə əlavə olunmadı');
      errorAlert('Xəta', err?.message || 'İcazə əlavə olunmadı');
    }
  };

  const handleEditPermission = async (id: number, name: string) => {
    try {
      await put(`/api/permissions/${id}`, { name });
      setIsEditModalOpen(false);
      fetchPermissions();
      successAlert('Uğurlu', 'İcazə redaktə olundu.');
    } catch (err: any) {
      setError(err?.message || 'İcazə redaktə olunmadı');
      errorAlert('Xəta', err?.message || 'İcazə redaktə olunmadı');
    }
  };

  const handleDeletePermission = async (permission: Permission) => {
    const confirmed = await confirmAlert(
      'İcazəni silmək istədiyinizə əminsiniz?',
      `"${permission.name}" icazəsi silinəcək.`
    );
    if (!confirmed) return;
    try {
      await del(`/api/permissions/${permission.id}`);
      setPermissions(
        permissions.filter(
          (p) => p.id !== permission.id,
        ),
      );
      fetchPermissions();
      successAlert('Uğurlu', 'İcazə silindi.');
    } catch (err: any) {
      setError(err?.message || 'İcazə silinmədi');
      errorAlert('Xəta', err?.message || 'İcazə silinmədi');
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader size={40} color="#6366f1" />
          <span className="text-gray-600 font-medium">İcazələr yüklənir...</span>
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
      <Breadcrumb pageName="İcazələr" />

      {/* Search & Add Button */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full">
          <input
            type="text"
            placeholder="İcazələri axtarın..."
            className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {hasAddPermission && (
            <button
              className="mt-2 sm:mt-0 sm:ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
              onClick={openAddModal}
            >
              <FaPlus className="w-4 h-4" />
              Yeni İcazə
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
                <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">İcazə</th>
                <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">İcazə tapılmadı</td>
                </tr>
              ) : (
                filteredPermissions.map((permission, idx) => (
                  <tr key={permission.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-6 border-b">{idx + 1}</td>
                    <td className="py-3 px-6 border-b">{permission.name}</td>
                    <td className="py-3 px-6 border-b text-center">
                      <div className="flex justify-center gap-1">
                        {hasEditPermission && (
                          <button
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded transition-colors"
                            onClick={() => openEditModal(permission)}
                            title="Redaktə et"
                          >
                            <FaRegEdit className="w-4 h-4" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded transition-colors"
                            onClick={() => handleDeletePermission(permission)}
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
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredPermissions.map((permission, index) => (
          <div
            key={permission.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  #{index + 1}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {permission.name}
                </h3>
              </div>
              <div className="flex gap-1">
                {hasEditPermission && (
                  <button
                    className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-1.5 rounded"
                    onClick={() => openEditModal(permission)}
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                )}
                {hasDeletePermission && (
                  <button
                    className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded"
                    onClick={() => handleDeletePermission(permission)}
                  >
                    <AiOutlineDelete className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPermissions.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaKey className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            İcazə tapılmadı
          </h3>
        </div>
      )}

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
    </div>
  );
};

export default PermissionsTable;