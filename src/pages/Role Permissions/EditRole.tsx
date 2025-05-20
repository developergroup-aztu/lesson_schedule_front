import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, put } from '../../api/service';

interface Permission {
  id: number;
  name: string;
}

const EditRole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await get(`/api/roles/${id}`);
        const roleData = response.data;
        setName(roleData.name);
        setSelectedPermissions(
          roleData.permissions.map((p: Permission) => p.id),
        );
      } catch (err: any) {
        console.error('Error fetching role:', err);
        setError(err.message || 'An error occurred');
      }
    };

    const fetchPermissions = async () => {
      try {
        const response = await get('/api/permissions');
        setPermissions(response.data);
      } catch (err: any) {
        console.error('Error fetching permissions:', err);
        setError(err.message || 'An error occurred');
      }
    };

    fetchRole();
    fetchPermissions();
  }, [id]);

  const handleUpdateRole = async () => {
    try {
      await put(`/api/roles/${id}`, {
        name: name,
        permission_ids: selectedPermissions,
      });
      navigate('/role');
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions((prevSelected) =>
      prevSelected.includes(permissionId)
        ? prevSelected.filter((id) => id !== permissionId)
        : [...prevSelected, permissionId],
    );
  };

  const groupedPermissions = permissions.reduce(
    (acc: { [key: string]: Permission[] }, permission) => {
      const [group] = permission.name.split('_');
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(permission);
      return acc;
    },
    {},
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Rolü Redaktə Et</h2>
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="bg-indigo-600 text-white px-4 text-sm py-2 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleUpdateRole}
        >
          Yenilə
        </button>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">İcazələr</h3>
        {Object.keys(groupedPermissions).map((group) => (
          <div key={group} className="mb-4">
            <h4 className="text-lg font-semibold mb-2 capitalize">{group}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedPermissions[group].map((permission) => (
                <label key={permission.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
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

export default EditRole;