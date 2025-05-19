import React, { useState } from 'react';

interface AddSemestrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (year: string, semester_num: string) => void;
}

const AddSemestrModal: React.FC<AddSemestrModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [year, setYear] = useState('');
  const [semesterNum, setSemesterNum] = useState('');

  const handleSubmit = () => {
    onSave(year, semesterNum);
    setYear('');
    setSemesterNum('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Yeni Semestr Əlavə Et</h2>
        <div className="mb-4">
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700"
          >
            İl
          </label>
          <input
            id="year"
            name="year"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="semesterNum"
            className="block text-sm font-medium text-gray-700"
          >
            Semestr Nömrəsi
          </label>
          <input
            id="semesterNum"
            name="semesterNum"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={semesterNum}
            onChange={(e) => setSemesterNum(e.target.value)}
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

export default AddSemestrModal;
