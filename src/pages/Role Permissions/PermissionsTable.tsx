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
      <div className="flex justify-center items-center h-[80vh] bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-2xl border border-indigo-100">
          <ClipLoader size={60} color="#6366f1" speedMultiplier={1.2} />
          <span className="text-indigo-700 font-semibold text-lg animate-pulse">
            İcazələr yüklənir...
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
      <Breadcrumb pageName="İcazələr" />

      {/* Header Card */}
      <div className="relative rounded-2xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 opacity-95" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-300 opacity-30 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-300 opacity-20 rounded-full blur-2xl" />
        <div className="relative p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <FaKey className="w-8 h-8" />
                İcazə İdarəetməsi
              </h1>
              <p className="text-indigo-100">
                Cəmi {filteredPermissions.length} icazə tapıldı
              </p>
            </div>
            {hasAddPermission && (
              <button
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={openAddModal}
              >
                <FaPlus className="w-5 h-5" />
                Yeni İcazə
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
        <input
          type="text"
          placeholder="İcazələri axtarın..."
          className="w-full md:w-2/4 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-gray-700 dark:text-gray-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <th className="py-4 px-6 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  İCAZƏ
                </th>
                <th className="py-4 px-6 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  ƏMƏLIYYATLAR
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map((permission, index) => (
                <tr
                  key={permission.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                  }`}
                >
                  <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700 text-lg font-medium text-gray-800 dark:text-gray-100">
                    {permission.name}
                  </td>
                  <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-center gap-2">
                      {hasEditPermission && (
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                          onClick={() => openEditModal(permission)}
                          title="Redaktə et"
                        >
                          <FaRegEdit className="w-4 h-4" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                          onClick={() => handleDeletePermission(permission)}
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
      <div className="md:hidden space-y-4">
        {filteredPermissions.map((permission) => (
          <div
            key={permission.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <FaKey className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                    {permission.name}
                  </h3>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {hasEditPermission && (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => openEditModal(permission)}
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                )}
                {hasDeletePermission && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaKey className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
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