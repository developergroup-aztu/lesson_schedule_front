import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/service';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { ClipLoader } from 'react-spinners';
import useSweetAlert from '../../hooks/useSweetAlert';

interface Permission {
  id: number;
  name: string;
}

const AddRole: React.FC = () => {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const navigate = useNavigate();
  const { successAlert, errorAlert } = useSweetAlert();

  useEffect(() => {
    // Component unmount olarkən state update-lərin qarşısını almaq üçün flag
    let isMounted = true; 

    const fetchPermissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await get('/api/permissions');
        if (isMounted) { // Yalnız komponent mounted olarsa state yenilənsin
          if (Array.isArray(response.data)) {
            setPermissions(response.data);
          } else {
            setPermissions([]);
            const errMsg = 'Serverdən icazə məlumatı düzgün gəlmədi.';
            setError(errMsg);
            errorAlert('Xəta', errMsg);
          }
        }
      } catch (err: any) {
        if (isMounted) { // Yalnız komponent mounted olarsa state yenilənsin
          console.error('Error fetching permissions:', err);
          const msg = err.response?.data?.message || err.message || 'İcazələr yüklənmədi';
          setError(msg);
          errorAlert('Xəta', msg);
          setPermissions([]);
        }
      } finally {
        if (isMounted) { // Yalnız komponent mounted olarsa state yenilənsin
          setLoading(false);
        }
      }
    };

    fetchPermissions(); // Komponent ilk yüklənəndə çağırılır

    // Cleanup funksiyası: Komponent unmount olarkən isMounted false olur
    return () => {
      isMounted = false;
    };
  }, []); // Boş asılılıq massivi: Yalnız komponent mount olanda bir dəfə çalışır

  const handleAddRole = async () => {
    if (!name.trim()) {
      setError('Rol adı boş ola bilməz.');
      errorAlert('Xəta', 'Rol adı boş ola bilməz.');
      return;
    }

    setIsAddingRole(true);
    setError(null);
    try {
      await post('/api/roles', {
        name: name,
        permissions: selectedPermissions,
      });
      successAlert('Uğurlu', 'Rol uğurla əlavə olundu.');
      navigate('/roles');
    } catch (err: any) {
      console.error('Error adding role:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Rol əlavə olunmadı.';
      setError(msg);
      errorAlert('Xəta', msg);
    } finally {
      setIsAddingRole(false);
    }
  };

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions((prevSelected) =>
      prevSelected.includes(permissionId)
        ? prevSelected.filter((id) => id !== permissionId)
        : [...prevSelected, permissionId],
    );
  };

  const groupedPermissions = permissions.reduce((acc: { [key: string]: Permission[] }, permission) => {
    const [group] = permission.name.split('_');
    const displayGroup = group.charAt(0).toUpperCase() + group.slice(1);
    if (!acc[displayGroup]) {
      acc[displayGroup] = [];
    }
    acc[displayGroup].push(permission);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader size={40} color="#3949AB" />
          <span className="text-gray-600 font-medium">İcazələr yüklənir...</span>
        </div>
      </div>
    );
  }

  if (error && !isAddingRole && permissions.length === 0) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow border border-red-200">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb pageName="Yeni Rol Əlavə Et" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Rol Məlumatları</h2>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6">
          <div className="sm:col-span-4">
            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol Adı <span className="text-red-500">*</span>
            </label>
            <input
              id="roleName"
              name="roleName"
              type="text"
              required
              className="mt-1 block px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rol daxil edin..."
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">İcazələr</h3>
          {Object.keys(groupedPermissions).length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Heç bir icazə tapılmadı.</p>
          ) : (
            Object.keys(groupedPermissions).map((group) => (
              <div key={group} className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">{group} İcazələri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                  {groupedPermissions[group].map((permission) => (
                    <label key={permission.id} className="flex items-center text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded focus:ring-indigo-500"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionChange(permission.id)}
                      />
                      <span className="ml-2 text-sm">
                        {permission.name.replace(`${group.toLowerCase()}_`, '').replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {error && isAddingRole && <p className="text-red-500 dark:text-red-400 mb-4 text-sm">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
            onClick={() => navigate('/roles')}
            disabled={isAddingRole}
          >
            Ləğv Et
          </button>
          <button
            type="button"
            className="inline-flex justify-center items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddRole}
            disabled={isAddingRole || loading}
          >
            {isAddingRole ? (
              <>
                <ClipLoader size={16} color="#ffffff" className="mr-2" /> Əlavə Edilir...
              </>
            ) : (
              'Əlavə Et'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRole;