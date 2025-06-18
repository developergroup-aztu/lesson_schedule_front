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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasDeleteRole = usePermissions('delete_role');
  const hasEditRole = usePermissions('edit_role');
  const hasAddRole = usePermissions('add_role');
  const hasViewRole = usePermissions('view_role');
  const { confirmAlert, successAlert, errorAlert } = useSweetAlert();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await get('/api/roles');
        setRoles(response.data);
        setLoading(false);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Rollar yüklənmədi';
        setError(msg);
        setLoading(false);
        errorAlert('Xəta', msg);
      }
    };

    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-2xl border border-indigo-100">
          <ClipLoader size={60} color="#6366f1" speedMultiplier={1.2} />
          <span className="text-indigo-700 font-semibold text-lg animate-pulse">
            Rollar yüklənir...
          </span>
        </div>
      </div>
    );
  }

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
      setError(msg);
      errorAlert('Xəta', msg);
    }
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

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
      <Breadcrumb pageName="Rollar" />

      {/* Header Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <FaShieldAlt className="w-8 h-8" />
              Rol İdarəetməsi
            </h1>
            <p className="text-indigo-100">
              Cəmi {roles.length} rol mövcuddur
            </p>
          </div>
          {hasAddRole && (
            <button
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => navigate('/roles/add')}
            >
              <FaPlus className="w-5 h-5" />
              Yeni Rol
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <th className="py-4 px-6 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  ROL
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  İCAZƏLƏR
                </th>
                <th className="py-4 px-6 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  ƏMƏLIYYATLAR
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => (
                <tr
                  key={role.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                  }`}
                >
                  <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white">
                        <HiUserGroup className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                          {role.name}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sistem rolu
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <HiLockClosed className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {role.permissions.length} İcazə
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-center gap-2">
                      {hasViewRole && (
                        <button
                          className="bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                          onClick={() => openPermissionsModal(role)}
                          title="İcazələrə bax"
                        >
                          <PiEyeLight className="w-4 h-4" />
                        </button>
                      )}
                      {hasEditRole && (
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                          onClick={() => navigate(`/roles/edit/${role.id}`)}
                          title="Redaktə et"
                        >
                          <FaRegEdit className="w-4 h-4" />
                        </button>
                      )}
                      {hasDeleteRole && (
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                          onClick={() => handleDeleteRole(role)}
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
      <div className="lg:hidden space-y-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <HiUserGroup className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                    {role.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Sistem rolu
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {hasViewRole && (
                  <button
                    className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => openPermissionsModal(role)}
                  >
                    <PiEyeLight className="w-4 h-4" />
                  </button>
                )}
                {hasEditRole && (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => navigate(`/roles/edit/${role.id}`)}
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                )}
                {hasDeleteRole && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => handleDeleteRole(role)}
                  >
                    <AiOutlineDelete className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-2 rounded-xl flex items-center gap-2">
                  <HiLockClosed className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {role.permissions.length} İcazə
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {roles.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Heç bir rol tapılmadı
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Sistemdə hələ heç bir rol yaradılmayıb
          </p>
          {hasAddRole && (
            <button
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
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