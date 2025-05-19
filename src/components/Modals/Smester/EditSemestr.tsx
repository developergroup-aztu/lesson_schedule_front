import React, { useState, useEffect } from 'react';

interface EditSemestrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (year: string, semester_num: string) => void;
  initialData: {
    id: number;
    year: string;
    semester_num: string;
  };
}

const EditSemestrModal: React.FC<EditSemestrModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [year, setYear] = useState(initialData.year);
  const [semesterNum, setSemesterNum] = useState(initialData.semester_num);

  useEffect(() => {
    if (isOpen) {
      setYear(initialData.year);
      setSemesterNum(initialData.semester_num);
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    onSave(year, semesterNum);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Semestri Redaktə Et</h2>
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

export default EditSemestrModal;
