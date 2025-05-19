import React from 'react';

interface DeleteLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteLessonModal: React.FC<DeleteLessonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed  h-screen w-full bg-[#0000006c]  inset-0 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg md:w-1/3">
        <h2 className="text-xl font-bold mb-4">Dərsi Sil</h2>
        <p className="mb-4">Bu dərsi silmək istədiyinizə əminsinizmi?</p>
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

export default DeleteLessonModal;
