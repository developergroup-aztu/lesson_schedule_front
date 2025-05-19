import React, { useState } from 'react';

interface Faculty {
  id: number;
  name: string;
}

interface Speciality {
  id: number;
  name: string;
  faculty_id: number;
}

interface EditSpecialityModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciality: Speciality;
  faculties: Faculty[];
  onConfirm: (specialityId: number, newFacultyId: number) => void;
}

const EditSpecialityModal: React.FC<EditSpecialityModalProps> = ({
  isOpen,
  onClose,
  speciality,
  faculties,
  onConfirm,
}) => {
  const [newFacultyId, setNewFacultyId] = useState<number>(
    speciality.faculty_id,
  );

  const handleSubmit = () => {
    onConfirm(speciality.id, newFacultyId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">İxtisası Redaktə Et</h2>
        <div className="mb-4">
          <label
            htmlFor="faculty"
            className="block text-sm font-medium text-gray-700"
          >
            Fakültə
          </label>
          <select
            id="faculty"
            name="faculty"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={newFacultyId}
            onChange={(e) => setNewFacultyId(Number(e.target.value))}
          >
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>
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

export default EditSpecialityModal;
