import React, { useEffect, useState } from 'react';
import { get } from '../../../api/service';
interface Faculty {
  id: number;
  name: string;
}

interface AddSpecialityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, facultyId: number) => void;
}

const AddSpecialityModal: React.FC<AddSpecialityModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('');
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await get('/api/faculties');
        setFaculties(response.data);
      } catch (err: any) {
        console.error('Error fetching faculties:', err);
      }
    };

    fetchFaculties();
  }, []);

  const handleConfirm = () => {
    if (facultyId !== null) {
      onConfirm(name, facultyId);
      setName('');
      setFacultyId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 w-full sm:w-2/3 md:w-2/6 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Yeni İxtisas Əlavə Et</h2>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-400 mb-2">Ad</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-400 mb-2">Fakültə</label>
          <select
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            value={facultyId !== null ? facultyId : ''}
            onChange={(e) => setFacultyId(Number(e.target.value))}
            required
          >
            <option value="">Fakültə seçin</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
            onClick={onClose}
          >
            İptal
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
            onClick={handleConfirm}
          >
            Əlavə et
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSpecialityModal;
