import React from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-20"></div>
      <div className="bg-white rounded-lg-lg shadow-lg p-6 z-10">
        <h2 className="text-base font-semibold mb-4">
          İstifadəçini silməyə əminsinizmi?
        </h2>
        <div className="flex justify-end">
          <button
            className="bg-gray-500 text-sm text-white px-2 py-1 rounded-lg mr-2"
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            className="bg-red-500 text-white text-sm px-2 py-1 rounded-lg"
            onClick={onConfirm}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
