import React, { useEffect, useState } from 'react';
import { get } from '../../api/service';
import { useNavigate } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners';

interface Room {
  id: number;
  name: string;
  room_capacity: number;
  corp_id: number;
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await get('/api/rooms');
        setRooms(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError('Otaqlar yüklənmədi');
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Otaqlar</h1>
        <div className="flex justify-center items-center h-[60vh]">
          <ClipLoader size={50} color={'#123abc'} loading={loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">Otaqlar</h1>
      <div className="bg-white rounded-lg shadow border">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#e3e3e3]">
              <th className="py-2 px-4 border-b text-left">#</th>
              <th className="py-2 px-4 border-b text-left">Otaq adı</th>
              <th className="py-2 px-4 border-b text-left">Tutum</th>
              <th className="py-2 px-4 border-b text-left">Korpus</th>
              <th className="py-2 px-4 border-b text-center">Bax</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-red-500">{error}</td>
              </tr>
            ) : Array.isArray(rooms) && rooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">Otaq tapılmadı</td>
              </tr>
            ) : (
              Array.isArray(rooms) &&
              rooms.map((room, idx) => (
                <tr key={room.id} className="hover:bg-gray-50 transition">
                  <td className="py-2 px-4 border-b">{idx + 1}</td>
                  <td className="py-2 px-4 border-b">{room.name}</td>
                  <td className="py-2 px-4 border-b">{room.room_capacity}</td>
                  <td className="py-2 px-4 border-b">{room.corp_id}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition-colors duration-200"
                      onClick={() => navigate(`/room/${room.id}/schedule`)}
                      title="Cədvələ bax"
                    >
                      <PiEyeLight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rooms;