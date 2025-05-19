import React from 'react';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  role,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 relative rounded-lg shadow-lg max-w-lg w-full h-3/4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{role.name} İcazələri</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <ul className="space-y-2 mb-6">
          {role.permissions.map((permission) => (
            <li
              key={permission.id}
              className="bg-gray-100 p-2 rounded-md shadow-sm"
            >
              {permission.name}
            </li>
          ))}
        </ul>
        <div className="text-right">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={onClose}
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;