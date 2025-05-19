import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import AddWeekTypeModal from '../components/Modals/Week/AddWeekType';
import EditWeekTypeModal from '../components/Modals/Week/EditWeekType';
import DeleteWeekTypeModal from '../components/Modals/Week/DeleteWeekType';
import ClipLoader from 'react-spinners/ClipLoader';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import usePermissions from '../hooks/usePermissions';

interface WeekType {
  id: number;
  name: string;
}

const WeekTypes: React.FC = () => {
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([]);
  const [selectedWeekType, setSelectedWeekType] = useState<WeekType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddWeekTypeModalOpen, setIsAddWeekTypeModalOpen] = useState(false);
  const [isEditWeekTypeModalOpen, setIsEditWeekTypeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasAddPermission = usePermissions('add_week_type');
  const hasEditPermission = usePermissions('edit_week_type');
  const hasDeletePermission = usePermissions('delete_week_type');

  useEffect(() => {
    fetchWeekTypes();
  }, []);

  const fetchWeekTypes = async () => {
    try {
      setLoading(true);
      const response = await get('/api/week_types');
      setWeekTypes(response.data);
    } catch (error) {
      console.error('Error fetching week types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (weekType: WeekType) => {
    setSelectedWeekType(weekType);
    setIsEditWeekTypeModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedWeekType) {
      try {
        await del(`/api/week_types/${selectedWeekType.id}`);
        setWeekTypes(weekTypes.filter((wt) => wt.id !== selectedWeekType.id));
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting week type:', error);
      }
    }
  };

  const openDeleteModal = (weekType: WeekType) => {
    setSelectedWeekType(weekType);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedWeekType(null);
    setIsDeleteModalOpen(false);
  };

  const openAddWeekTypeModal = () => {
    setSelectedWeekType(null);
    setIsAddWeekTypeModalOpen(true);
  };

  const closeAddWeekTypeModal = () => {
    setSelectedWeekType(null);
    setIsAddWeekTypeModalOpen(false);
  };

  const closeEditWeekTypeModal = () => {
    setSelectedWeekType(null);
    setIsEditWeekTypeModalOpen(false);
  };

  const handleSaveWeekType = async (name: string) => {
    try {
      if (selectedWeekType) {
        await put(`/api/week_types/${selectedWeekType.id}`, { name });
        setWeekTypes(
          weekTypes.map((wt) =>
            wt.id === selectedWeekType.id ? { ...wt, name } : wt,
          ),
        );
      } else {
        const response = await post('/api/week_types', { name });
        setWeekTypes([...weekTypes, response.data]);
      }
      closeAddWeekTypeModal();
      closeEditWeekTypeModal();
      fetchWeekTypes(); // Yeni hafta tipi eklendikten sonra tabloyu yenile
    } catch (error) {
      console.error('Error saving week type:', error);
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Həftə Tipleri</h2>
      {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={openAddWeekTypeModal}
        >
          Yeni Həftə Tipi Əlavə Et
        </button>
      )}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center">
            <ClipLoader size={50} color={'#123abc'} loading={loading} />
          </div>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-800">
                <th className="py-2 px-4 border-b">Ad</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {weekTypes.map((weekType) => (
                <tr
                  key={weekType.id}
                  className="hover:bg-gray-100 dark:bg-gray-700 transition-all duration-300 ease-linear"
                >
                  <td className="py-2 px-4 border-b text-center">
                    {weekType.name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {hasEditPermission && (
                      <button
                        className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                        onClick={() => handleEdit(weekType)}
                      >
                        <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        className="bg-red-500 text-white p-2 rounded-lg"
                        onClick={() => openDeleteModal(weekType)}
                      >
                        <AiOutlineDelete className="w-3 md:w-5 h-3 md:h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DeleteWeekTypeModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <AddWeekTypeModal
        isOpen={isAddWeekTypeModalOpen}
        onClose={closeAddWeekTypeModal}
        onSave={handleSaveWeekType}
      />

      {selectedWeekType && (
        <EditWeekTypeModal
          isOpen={isEditWeekTypeModalOpen}
          onClose={closeEditWeekTypeModal}
          onSave={handleSaveWeekType}
          initialData={{
            id: selectedWeekType.id,
            name: selectedWeekType.name,
          }}
        />
      )}
    </div>
  );
};

export default WeekTypes;