import React, { useState } from 'react';

interface AddFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const AddFacultyModal: React.FC<AddFacultyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    onConfirm(name);
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 w-full sm:w-2/3 md:w-2/6 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Yeni Fakültə Əlavə Et</h2>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-400">Fakültə Adı</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2"
          >
            Ləğv et
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Əlavə et
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFacultyModal;
