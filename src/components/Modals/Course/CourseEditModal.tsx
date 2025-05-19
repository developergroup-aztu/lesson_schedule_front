import React, { useState, useEffect } from 'react';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, name: string) => void;
  course: {
    id: number;
    name: string;
  } | null;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  course,
}) => {
  const [name, setName] = useState(course ? course.name : '');

  useEffect(() => {
    if (isOpen && course) {
      setName(course.name);
    }
  }, [isOpen, course]);

  const handleSubmit = () => {
    if (course && name.trim() !== '') {
      onSave(course.id, name);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 h-screen w-full bg-[#0000006c] flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg md:w-1/3">
        <h2 className="text-xl font-bold mb-4">Kursu Redaktə Et</h2>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Ad
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="mt-1 block w-full px-3 py-2 border dark:bg-gray-700 border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            onClick={handleSubmit}
          >
            Təsdiq et
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;