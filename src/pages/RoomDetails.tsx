import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../api/service';
import ClipLoader from 'react-spinners/ClipLoader';

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

const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const response = await get(`/api/rooms/${id}`);
        setRoom(response.data);
      } catch (error) {
        console.error('Error fetching room details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  if (!room) {
    return <div>Otaq tapılmadı</div>;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Otaq Detalları</h2>
      <div className="mb-4">
        <strong>Ad:</strong> {room.name}
      </div>
      <div className="mb-4">
        <strong>Tutum:</strong> {room.room_capacity}
      </div>
      <div className="mb-4">
        <strong>Kafedra:</strong> {room.department.name}
      </div>
      <div className="mb-4">
        <strong>Otaq Tipi:</strong> {room.room_type.name}
      </div>
      <div className="mb-4">
        <strong>Korpus:</strong> {room.corp ? room.corp.name : 'N/A'}
      </div>
    </div>
  );
};

export default RoomDetails;