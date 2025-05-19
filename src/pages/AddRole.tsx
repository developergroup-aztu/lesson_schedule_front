import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../api/service';

interface Permission {
  id: number;
  name: string;
}

const AddRole: React.FC = () => {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await get('/api/permissions');
        setPermissions(response.data);
      } catch (err: any) {
        console.error('Error fetching permissions:', err);
        setError(err.message || 'An error occurred');
      }
    };

    fetchPermissions();
  }, []);

  const handleAddRole = async () => {
    try {
      await post('/api/roles', {
        name: name,
        permissions: selectedPermissions,
      });
      navigate('/role');
    } catch (err: any) {
      console.error('Error adding role:', err);
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions((prevSelected) =>
      prevSelected.includes(permissionId)
        ? prevSelected.filter((id) => id !== permissionId)
        : [...prevSelected, permissionId]
    );
  };

  const groupedPermissions = permissions.reduce((acc: { [key: string]: Permission[] }, permission) => {
    const [group] = permission.name.split('_');
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(permission);
    return acc;
  }, {});

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-6">Yeni Rol Əlavə Et</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4 flex items-end">
        <div className="w-2/6 mr-4">
          <label
            htmlFor="roleName"
            className="block text-sm font-medium text-gray-700"
          >
            Rol Adı
          </label>
          <input
            id="roleName"
            name="roleName"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="bg-indigo-600 text-white px-4 text-sm py-2 rounded-lg-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleAddRole}
        >
          Əlavə Et
        </button>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">İcazələr</h3>
        {Object.keys(groupedPermissions).map((group) => (
          <div key={group} className="mb-4">
            <h4 className="text-lg font-semibold mb-2 capitalize">{group}</h4>
            <div className="grid grid-cols-2 gap-4">
              {groupedPermissions[group].map((permission) => (
                <label key={permission.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                  />
                  <span className="ml-2">{permission.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddRole;
