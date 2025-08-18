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
import { useSearchParams } from 'react-router-dom';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchParams, setSearchParams] = useSearchParams();
  const { confirmAlert, successAlert, errorAlert } = useSweetAlert();

  // On mount, set currentPage from URL if present
  useEffect(() => {
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(pageParam > 0 ? pageParam : 1);
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const fetchPermissions = async (page = 1) => {
      setLoading(true); // Set loading to true when fetching starts
      setError(null);
      try {
        const response = await get(`/api/permissions?page=${page}`);
        if (!isMounted) return; // Check if component is still mounted

        if (response.data && Array.isArray(response.data.data)) {
          setPermissions(response.data.data);
          setCurrentPage(response.data.current_page || 1);
          setLastPage(response.data.last_page || 1);
          setTotal(response.data.total || 0);
          setPerPage(response.data.per_page || 10);
        } else {
          setPermissions([]);
          const errMsg = 'Serverdən düzgün icazə məlumatı gəlmədi.';
          setError(errMsg);
          errorAlert('Xəta', errMsg);
        }
      } catch (err: any) {
        if (!isMounted) return; // Check if component is still mounted
        const msg = err?.response?.data?.message || err?.message || 'İcazələr yüklənmədi';
        setError(msg);
        errorAlert('Xəta', msg);
        setPermissions([]);
      } finally {
        if (isMounted) setLoading(false); // Only set loading to false if mounted
      }
    };
    fetchPermissions(currentPage);
    setSearchParams({ page: String(currentPage) }); // Update URL search params
    return () => {
      isMounted = false; // Cleanup: set isMounted to false when component unmounts
    };
  }, [currentPage, setSearchParams]); // Dependencies: refetch when currentPage or setSearchParams changes

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
      // Re-fetch permissions from the first page to see the new entry
      setCurrentPage(1);
      successAlert('Uğurlu', 'İcazə əlavə olundu.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'İcazə əlavə olunmadı';
      setError(msg);
      errorAlert('Xəta', msg);
    }
  };

  const handleEditPermission = async (id: number, name: string) => {
    try {
      await put(`/api/permissions/${id}`, { name });
      setIsEditModalOpen(false);
      // Re-fetch permissions to reflect the update on the current page
      // No need to change currentPage unless the edit specifically impacts pagination logic (e.g., changing perPage)
      setCurrentPage(currentPage);
      successAlert('Uğurlu', 'İcazə redaktə olundu.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'İcazə redaktə olunmadı';
      setError(msg);
      errorAlert('Xəta', msg);
    }
  };

  const handleDeletePermission = async (permission: Permission) => {
    const confirmed = await confirmAlert(
      'İcazəni silmək istədiyinizə əminsiniz?',
      `"${permission.name}" icazəsi silinəcək.`,
    );
    if (!confirmed) return;
    try {
      await del(`/api/permissions/${permission.id}`);
      // Re-fetch permissions, potentially moving to a previous page if the last item of the current page was deleted
      // Simple re-fetch of current page will work if backend handles empty pages correctly.
      // For more robust behavior, you might need to check if current page is now empty and adjust.
      setCurrentPage((prev) => (filteredPermissions.length === 1 && prev > 1 ? prev - 1 : prev));
      successAlert('Uğurlu', 'İcazə silindi.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'İcazə silinmədi';
      setError(msg);
      errorAlert('Xəta', msg);
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEditModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  // Function to get pagination page numbers similar to FacultyList
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
      if (startPage > 2) pages.push(-1); // -1 signifies ellipsis
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < lastPage) {
      if (endPage < lastPage - 1) pages.push(-1); // -1 signifies ellipsis
      pages.push(lastPage);
    }

    return pages;
  };

  // Only show the full-page error if there's an error after the initial load or a critical error.
  // The loading state will now be handled within the table.
  if (error && !loading) { // Check !loading to ensure the error isn't just a temporary state during a fetch
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
              className="mt-2 sm:mt-0 sm:ml-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center shadow"
              onClick={openAddModal}
            >
              <FaPlus className="w-3 h-3" />
              Yeni İcazə
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-indigo-50">
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">İcazə</th>
              <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <ClipLoader size={30} color="#3949AB" />
                  </div>
                </td>
              </tr>
            ) : filteredPermissions.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">İcazə tapılmadı</td>
              </tr>
            ) : (
              filteredPermissions.map((permission, idx) => (
                <tr key={permission.id} className={`${(idx) % 2 === 1 ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition`}>
                  <td className="py-3 px-6 border-b">{(currentPage - 1) * perPage + idx + 1}</td>
                  <td className="py-3 px-6 border-b">{permission.name}</td>
                  <td className="py-3 px-6 border-b text-center">
                    <div className="flex justify-center gap-1">
                      {hasEditPermission && (
                        <button
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-1.5 rounded-lg transition-colors"
                          onClick={() => openEditModal(permission)}
                          title="Redaktə et"
                        >
                          <FaRegEdit className="w-4 h-4" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-lg transition-colors"
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

      {/* Pagination Controls */}
      {lastPage > 1 && (
        <div className="flex justify-center pt-4">
          <nav className="inline-flex rounded-md gap-2.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-lg ${
                    page === currentPage
                      ? 'bg-indigo-600 text-white border-indigo-600 '
                      : 'bg-white text-slate-700 hover:bg-indigo-100 hover:border-indigo-100 border-stroke'
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="px-3 py-1 border border-stroke rounded-lg bg-white text-slate-500 hover:bg-indigo-100 hover:border-indigo-100 disabled:opacity-50"
            >
              »
            </button>
          </nav>
        </div>
      )}

      {/* Mobile Card View (remains unchanged for its loading/empty state) */}
      <div className="lg:hidden space-y-3">
        {loading ? ( // Apply loader to mobile view as well
          <div className="flex justify-center items-center h-40"> {/* Adjust height as needed */}
            <div className="flex flex-col items-center gap-4">
              <ClipLoader size={30} color="#3949AB" />
            </div>
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaKey className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              İcazə tapılmadı
            </h3>
          </div>
        ) : (
          filteredPermissions.map((permission, index) => (
            <div
              key={permission.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    #{(currentPage - 1) * perPage + index + 1}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {permission.name}
                  </h3>
                </div>
                <div className="flex gap-1">
                  {hasEditPermission && (
                    <button
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-1.5 rounded transition-colors"
                      onClick={() => openEditModal(permission)}
                      title="Redaktə et"
                    >
                      <FaRegEdit className="w-4 h-4" />
                    </button>
                  )}
                  {hasDeletePermission && (
                    <button
                      className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded transition-colors"
                      onClick={() => handleDeletePermission(permission)}
                      title="Sil"
                    >
                      <AiOutlineDelete className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* The empty state for desktop can now be simplified or removed as the table's empty state handles it */}
      {filteredPermissions.length === 0 && !loading && ( // Only show this if not loading and no permissions found
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-8 text-center">
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
          onConfirm={(name) => handleEditPermission(selectedPermission.id, name)}
          initialName={selectedPermission?.name || ''}
        />
      )}
    </div>
  );
};

export default PermissionsTable;