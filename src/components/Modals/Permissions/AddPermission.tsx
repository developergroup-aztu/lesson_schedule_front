import React, { useState } from 'react';

interface AddPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const AddPermissionModal: React.FC<AddPermissionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full sm:w-2/3 md:w-2/6 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Yeni İcazə Əlavə Et</h2>
        <div className="mb-4">
          <label className="block text-gray-700">İcazə Adı</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="İcazə adını daxil edin"
          />
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => onConfirm(name)}
          >
            Əlavə et
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPermissionModal;
