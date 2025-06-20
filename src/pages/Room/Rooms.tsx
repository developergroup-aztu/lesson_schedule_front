import React, { useEffect, useState } from 'react';
import { get } from '../../api/service';
import { useNavigate } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners';
import { FaPlus } from 'react-icons/fa6';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

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
    let isMounted = true;
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await get('/api/rooms');
        if (!isMounted) return;
        if (Array.isArray(res.data)) {
          setRooms(res.data);
        } else {
          setRooms([]);
          setError('Serverdən düzgün otaq məlumatı gəlmədi.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Otaqlar yüklənmədi';
        setError(msg);
        setRooms([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader size={40} color="#6366f1" />
          <span className="text-gray-600 font-medium">Otaqlar yüklənir...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
          <Breadcrumb pageName="Otaqlar" />



      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Otaq adı</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Tutum</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Korpus</th>
              <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">Bax</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">Otaq tapılmadı</td>
              </tr>
            ) : (
              rooms.map((room, idx) => (
                <tr key={room.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-6 border-b">{idx + 1}</td>
                  <td className="py-3 px-6 border-b">{room.name}</td>
                  <td className="py-3 px-6 border-b">{room.room_capacity}</td>
                  <td className="py-3 px-6 border-b">{room.corp_id}</td>
                  <td className="py-3 px-6 border-b text-center">
                    <button
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded transition-colors"
                      onClick={() => navigate(`/rooms/${room.id}`)}
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