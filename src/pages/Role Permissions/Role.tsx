import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del } from '../../api/service';
import PermissionsModal from '../../components/Modals/Permissions/RolePermissionModal';
import usePermissions from '../../hooks/usePermissions';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegEdit, FaShieldAlt, FaPlus } from 'react-icons/fa';
import { PiEyeLight } from 'react-icons/pi';
import { HiUserGroup, HiLockClosed } from 'react-icons/hi';
import { ClipLoader } from 'react-spinners';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import useSweetAlert from '../../hooks/useSweetAlert';

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
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Initial loading state
  const navigate = useNavigate();
  const hasDeleteRole = usePermissions('delete_role');
  const hasEditRole = usePermissions('edit_role');
  const hasAddRole = usePermissions('add_role');
  const hasViewRole = usePermissions('view_role');
  const { confirmAlert, successAlert, errorAlert } = useSweetAlert();

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component
    const fetchRoles = async () => {
      setLoading(true); // Set loading to true before fetch
      setError(null); // Clear previous errors
      try {
        const response = await get('/api/roles');
        if (isMounted) {
          setRoles(response.data);
        }
      } catch (err: any) {
        if (isMounted) {
          const msg = err?.response?.data?.message || err?.message || 'Rollar yüklənmədi';
          setError(msg);
          errorAlert('Xəta', msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false); // Set loading to false after fetch, regardless of success or error
        }
      }
    };

    fetchRoles();

    return () => {
      isMounted = false; // Cleanup: set isMounted to false when component unmounts
    };
  }, []);

  const handleDeleteRole = async (role: Role) => {
    const confirmed = await confirmAlert(
      'Rolu silmək istədiyinizə əminsiniz?',
      `"${role.name}" rolu silinəcək.`
    );
    if (!confirmed) return;
    try {
      await del(`/api/roles/${role.id}`);
      setRoles(roles.filter((r) => r.id !== role.id));
      successAlert('Uğurlu', 'Rol silindi.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Rol silinmədi';
      setError(msg); // Set error for the component to display
      errorAlert('Xəta', msg);
    }
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

  // Render a full-page error if a critical error occurred and loading is complete
  if (error && !loading) {
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
      <Breadcrumb pageName="Rollar" />
      {hasAddRole && (
        <div className="flex justify-end mb-4">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-sm text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow"
            onClick={() => navigate('/roles/add')}
          >
            <FaPlus className="w-3 h-3" />
            Yeni Rol
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto hidden lg:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-indigo-50">
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">ROL</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">İCAZƏLƏR</th>
              <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">ƏMƏLIYYATLAR</th>
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
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">Heç bir rol tapılmadı</td>
              </tr>
            ) : (
              roles.map((role, index) => (
                <tr
                  key={role.id}
                  className={`hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}`}
                >
                  <td className="py-3 px-6 border-b">
                    <span className="font-medium text-gray-900">{role.name}</span>
                  </td>
                  <td className="py-3 px-6 border-b">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {role.permissions.length} İcazə
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 border-b text-center">
                    <div className="flex justify-center gap-1">
                      {hasViewRole && (
                        <button
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded-lg transition-colors"
                          onClick={() => openPermissionsModal(role)}
                          title="İcazələrə bax"
                        >
                          <PiEyeLight className="w-4 h-4" />
                        </button>
                      )}
                      {hasEditRole && (
                        <button
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-1.5 rounded-lg transition-colors"
                          onClick={() => navigate(`/roles/edit/${role.id}`)}
                          title="Redaktə et"
                        >
                          <FaRegEdit className="w-4 h-4" />
                        </button>
                      )}
                      {hasDeleteRole && (
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-lg transition-colors"
                          onClick={() => handleDeleteRole(role)}
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
        {loading ? (
          <div className="flex justify-center items-center h-40"> {/* Adjusted height for loader */}
            <div className="flex flex-col items-center gap-4">
              <ClipLoader size={30} color="#3949AB" />
            </div>
          </div>
        ) : roles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Heç bir rol tapılmadı
            </h3>
            <p className="text-gray-500 mb-6">
              Sistemdə hələ heç bir rol yaradılmayıb
            </p>
            {hasAddRole && (
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-colors font-medium shadow"
                onClick={() => navigate('/roles/add')}
              >
                İlk Rolu Yarat
              </button>
            )}
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl shadow border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                    <HiUserGroup className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {role.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Sistem rolu
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {hasViewRole && (
                    <button
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded-lg transition-colors"
                      onClick={() => openPermissionsModal(role)}
                    >
                      <PiEyeLight className="w-4 h-4" />
                    </button>
                  )}
                  {hasEditRole && (
                    <button
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-1.5 rounded-lg transition-colors"
                      onClick={() => navigate(`/roles/edit/${role.id}`)}
                    >
                      <FaRegEdit className="w-4 h-4" />
                    </button>
                  )}
                  {hasDeleteRole && (
                    <button
                      className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-lg transition-colors"
                      onClick={() => handleDeleteRole(role)}
                    >
                      <AiOutlineDelete className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-2xl flex items-center gap-2">
                    <HiLockClosed className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {role.permissions.length} İcazə
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State for Desktop (only shown if no roles and not loading) */}
      {roles.length === 0 && !loading && (
        <div className="hidden lg:block bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Heç bir rol tapılmadı
          </h3>
          <p className="text-gray-500 mb-6">
            Sistemdə hələ heç bir rol yaradılmayıb
          </p>
          {hasAddRole && (
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-colors font-medium shadow"
              onClick={() => navigate('/roles/add')}
            >
              İlk Rolu Yarat
            </button>
          )}
        </div>
      )}

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