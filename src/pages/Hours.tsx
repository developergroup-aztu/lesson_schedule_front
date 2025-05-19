import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import AddHourModal from '../components/Modals/Hours/AddHours';
import EditHourModal from '../components/Modals/Hours/EditHours';
import DeleteHourModal from '../components/Modals/Hours/DeleteHours';
import ClipLoader from 'react-spinners/ClipLoader';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import usePermissions from '../hooks/usePermissions';
import Swal from 'sweetalert2';


interface Hour {
  id: number;
  name: string;
}

const Hours: React.FC = () => {
  const [hours, setHours] = useState<Hour[]>([]);
  const [selectedHour, setSelectedHour] = useState<Hour | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddHourModalOpen, setIsAddHourModalOpen] = useState(false);
  const [isEditHourModalOpen, setIsEditHourModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasAddPermission = usePermissions('add_hour');
  const hasEditPermission = usePermissions('edit_hour');
  const hasDeletePermission = usePermissions('delete_hour');
  const hasViewPermission = usePermissions('view_hour');

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    try {
      setLoading(true);
      const response = await get('/api/hours');
      setHours(response.data);
    } catch (error) {
      console.error('Error fetching hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hour: Hour) => {
    setSelectedHour(hour);
    setIsEditHourModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedHour) {
      try {
        await del(`/api/hours/${selectedHour.id}`);
        setHours(hours.filter((h) => h.id !== selectedHour.id));
        closeDeleteModal();
        Swal.fire({
          title: 'Silindi!',
          text: 'Saat uğurla silindi.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Error deleting hour:', error);
        Swal.fire({
          title: 'Xəta!',
          text: error.response?.data?.message || 'Fakültəni silərkən xəta baş verdi.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const openDeleteModal = (hour: Hour) => {
    setSelectedHour(hour);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedHour(null);
    setIsDeleteModalOpen(false);
  };

  const openAddHourModal = () => {
    setSelectedHour(null);
    setIsAddHourModalOpen(true);
  };

  const closeAddHourModal = () => {
    setSelectedHour(null);
    setIsAddHourModalOpen(false);
  };

  const closeEditHourModal = () => {
    setSelectedHour(null);
    setIsEditHourModalOpen(false);
  };

  const handleSaveHour = async (name: string) => {
    try {
      if (selectedHour) {
        await put(`/api/hours/${selectedHour.id}`, { name });
        setHours(
          hours.map((h) => (h.id === selectedHour.id ? { ...h, name } : h)),
        );
      } else {
        const response = await post('/api/hours', { name });
        setHours([...hours, response.data]);
      }
      closeAddHourModal();
      closeEditHourModal();
      fetchHours(); 
    } catch (error) {
      console.error('Error saving hour:', error);
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Dərs Saatları</h2>
      {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={openAddHourModal}
        >
          Yeni Saat Əlavə Et
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
              <tr className="bg-gray-200  dark:bg-gray-800">
                <th className="py-2 px-4 border-b">Ad</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr
                  key={hour.id}
                  className="hover:bg-gray-100  dark:bg-gray-700"
                >
                  <td className="py-2 px-4 border-b text-center">
                    {hour.name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {hasEditPermission && (
                      <button
                        className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                        onClick={() => handleEdit(hour)}
                      >
                        <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        className="bg-red-500 text-white p-2 rounded-lg"
                        onClick={() => openDeleteModal(hour)}
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

      <DeleteHourModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <AddHourModal
        isOpen={isAddHourModalOpen}
        onClose={closeAddHourModal}
        onSave={handleSaveHour}
      />

      {selectedHour && (
        <EditHourModal
          isOpen={isEditHourModalOpen}
          onClose={closeEditHourModal}
          onSave={handleSaveHour}
          initialData={{
            id: selectedHour.id,
            name: selectedHour.name,
          }}
        />
      )}
    </div>
  );
};

export default Hours;