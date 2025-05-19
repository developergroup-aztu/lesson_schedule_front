import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import AddRoomModal from '../components/Modals/Room/AddRoom';
import EditRoomModal from '../components/Modals/Room/EditRoom';
import DeleteRoomModal from '../components/Modals/Room/DeleteRoom';
import ClipLoader from 'react-spinners/ClipLoader';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegEdit } from 'react-icons/fa';
import { PiEyeLight } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../hooks/usePermissions';

interface Room {
  id: number;
  name: string;
  room_capacity: number;
  department: {
    id: number;
    name: string;
  };
  room_type: {
    id: number;
    name: string;
  };
  corp: {
    id: number;
    name: string;
  } | null;
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const hasAddPermission = usePermissions('add_room');
  const hasEditPermission = usePermissions('edit_room');
  const hasDeletePermission = usePermissions('delete_room');
  const hasViewPermission = usePermissions('view_room');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await get('/api/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsEditRoomModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedRoom) {
      try {
        await del(`/api/rooms/${selectedRoom.id}`);
        setRooms(rooms.filter((r) => r.id !== selectedRoom.id));
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const openDeleteModal = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedRoom(null);
    setIsDeleteModalOpen(false);
  };

  const openAddRoomModal = () => {
    setSelectedRoom(null);
    setIsAddRoomModalOpen(true);
  };

  const closeAddRoomModal = () => {
    setSelectedRoom(null);
    setIsAddRoomModalOpen(false);
  };

  const closeEditRoomModal = () => {
    setSelectedRoom(null);
    setIsEditRoomModalOpen(false);
  };

  const handleSaveRoom = async (
    name: string,
    room_capacity: number,
    department_id: number | null,
    room_type_id: number,
    corp_id: number,
  ) => {
    try {
      const roomData: any = {
        name,
        room_capacity,
        room_type_id,
        corp_id,
      };

      if (room_type_id !== 2) {
        roomData.department_id = department_id;
      }

      if (selectedRoom) {
        await put(`/api/rooms/${selectedRoom.id}`, roomData);
        setRooms(
          rooms.map((r) =>
            r.id === selectedRoom.id
              ? {
                  ...r,
                  name,
                  room_capacity,
                  department: { ...r.department, id: department_id },
                  room_type: { ...r.room_type, id: room_type_id },
                  corp: { ...r.corp, id: corp_id },
                }
              : r,
          ),
        );
        closeEditRoomModal();
        fetchRooms(); // Redaktə edildikdən sonra tabloyu yenile
      } else {
        const response = await post('/api/rooms', roomData);
        setRooms([...rooms, response.data]);
        closeAddRoomModal();
        fetchRooms(); // Yeni oda eklendikten sonra tabloyu yenile
      }
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Otaqlar</h2>
      {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={openAddRoomModal}
        >
          Yeni Otaq Əlavə Et
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
                <th className="py-2 px-4 border-b">Tutum</th>
                <th className="py-2 px-4 border-b">Kafedra</th>
                <th className="py-2 px-4 border-b">Otaq Tipi</th>
                <th className="py-2 px-4 border-b">Korpus</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr
                  key={room.id}
                  className="hover:bg-gray-100 dark:bg-gray-700  transition-all duration-300 ease-linear"
                >
                  <td className="py-2 px-4 border-b text-center">
                    {room.name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {room.room_capacity}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {room?.department?.name == null ? '-' : room.department.name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {room.room_type.name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {room.corp ? room.corp.name : 'N/A'}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {hasViewPermission && (
                      <button
                        className="bg-[#d29a00] text-white p-2 rounded-lg mr-2"
                        onClick={() => navigate(`/rooms/${room.id}`)}
                      >
                        <PiEyeLight className="w-3 md:w-5 h-3 md:h-5" />
                      </button>
                    )}
                    {hasEditPermission && (
                      <button
                        className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                        onClick={() => handleEdit(room)}
                      >
                        <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        className="bg-red-500 text-white p-2 rounded-lg"
                        onClick={() => openDeleteModal(room)}
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

      <DeleteRoomModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={closeAddRoomModal}
        onSave={handleSaveRoom}
      />

      {selectedRoom && (
        <EditRoomModal
          isOpen={isEditRoomModalOpen}
          onClose={closeEditRoomModal}
          onSave={handleSaveRoom}
          initialData={{
            id: selectedRoom.id,
            name: selectedRoom.name,
            room_capacity: selectedRoom.room_capacity,
            department_id: selectedRoom?.department?.id,
            room_type_id: selectedRoom.room_type.id,
            corp_id: selectedRoom.corp ? selectedRoom.corp.id : 0,
          }}
        />
      )}
    </div>
  );
};

export default Rooms;