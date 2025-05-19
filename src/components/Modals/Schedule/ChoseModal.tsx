import React from 'react';

interface SelectActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SelectActionModal: React.FC<SelectActionModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl mb-4">Seçimlər</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2"
          onClick={onEdit}
        >
          Redaktə et
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
          onClick={onDelete}
        >
          Sil
        </button>
        <button
          className="mt-4 text-gray-500"
          onClick={onClose}
        >
          Bağla
        </button>
      </div>
    </div>
  );
};

export default SelectActionModal;