import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import AddRoomTypeModal from '../components/Modals/Room/AddRoomType';
import EditRoomTypeModal from '../components/Modals/Room/EditRoomType';
import DeleteRoomTypeModal from '../components/Modals/Room/DeleteRoomType';
import ClipLoader from 'react-spinners/ClipLoader';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegEdit } from 'react-icons/fa';
import usePermissions from '../hooks/usePermissions';

interface RoomType {
  id: number;
  name: string;
}

const RoomType: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddRoomTypeModalOpen, setIsAddRoomTypeModalOpen] = useState(false);
  const [isEditRoomTypeModalOpen, setIsEditRoomTypeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasAddPermission = usePermissions('add_room_type');
  const hasEditPermission = usePermissions('edit_room_type');
  const hasDeletePermission = usePermissions('delete_room_type');
  const hasViewPermission = usePermissions('view_room_type');

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const response = await get('/api/room_types');
      setRoomTypes(response.data);
    } catch (error) {
      console.error('Error fetching room types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setIsEditRoomTypeModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedRoomType) {
      try {
        await del(`/api/room_types/${selectedRoomType.id}`);
        setRoomTypes(roomTypes.filter((rt) => rt.id !== selectedRoomType.id));
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting room type:', error);
      }
    }
  };

  const openDeleteModal = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedRoomType(null);
    setIsDeleteModalOpen(false);
  };

  const openAddRoomTypeModal = () => {
    setSelectedRoomType(null);
    setIsAddRoomTypeModalOpen(true);
  };

  const closeAddRoomTypeModal = () => {
    setSelectedRoomType(null);
    setIsAddRoomTypeModalOpen(false);
  };

  const closeEditRoomTypeModal = () => {
    setSelectedRoomType(null);
    setIsEditRoomTypeModalOpen(false);
  };

  const handleSaveRoomType = async (name: string) => {
    try {
      if (selectedRoomType) {
        await put(`/api/room_types/${selectedRoomType.id}`, { name });
        setRoomTypes(
          roomTypes.map((rt) =>
            rt.id === selectedRoomType.id ? { ...rt, name } : rt,
          ),
        );
      } else {
        const response = await post('/api/room_types', { name });
        setRoomTypes([...roomTypes, response.data]);
      }
      closeAddRoomTypeModal();
      closeEditRoomTypeModal();
      fetchRoomTypes(); // Yeni oda tipi eklendikten sonra tabloyu yenile
    } catch (error) {
      console.error('Error saving room type:', error);
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Otaq Tipleri</h2>
      {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={openAddRoomTypeModal}
        >
          Yeni Otaq Tipi Əlavə Et
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
              {roomTypes.map((roomType) => (
                <tr
                  key={roomType.id}
                  className="hover:bg-gray-100  dark:bg-gray-700"
                >
                  <td className="py-2 px-4 border-b text-center">
                    {roomType.name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {hasEditPermission && (
                      <button
                        className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                        onClick={() => handleEdit(roomType)}
                      >
                        <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        className="bg-red-500 text-white p-2 rounded-lg"
                        onClick={() => openDeleteModal(roomType)}
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

      <DeleteRoomTypeModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <AddRoomTypeModal
        isOpen={isAddRoomTypeModalOpen}
        onClose={closeAddRoomTypeModal}
        onSave={handleSaveRoomType}
      />

      {selectedRoomType && (
        <EditRoomTypeModal
          isOpen={isEditRoomTypeModalOpen}
          onClose={closeEditRoomTypeModal}
          onSave={handleSaveRoomType}
          initialData={{
            id: selectedRoomType.id,
            name: selectedRoomType.name,
          }}
        />
      )}
    </div>
  );
};

export default RoomType;