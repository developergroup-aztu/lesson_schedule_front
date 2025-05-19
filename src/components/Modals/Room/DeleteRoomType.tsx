import React from 'react';

interface DeleteRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteRoomTypeModal: React.FC<DeleteRoomTypeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Otaq Tipini Sil</h2>
        <p className="mb-4">Bu otaq tipini silmək istədiyinizə əminsinizmi?</p>
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
            onClick={onConfirm}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoomTypeModal;
