import React, { useEffect, useState } from 'react';
import { PiEyeLight } from 'react-icons/pi';
import Breadcrumb from './../components/Breadcrumbs/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { get } from '../api/service';
import usePermissions from '../hooks/usePermissions';
import { ClipLoader } from 'react-spinners'; // react-spinners'dan ClipLoader'ı ekleyin

const RoomPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true); // Yükleme durumunu ekleyin
  const navigate = useNavigate();

  const hasViewPermission = usePermissions('view_room_permission');

  useEffect(() => {
    fetchPermissions();
  }, [activeTab]);

  const fetchPermissions = async () => {
    try {
      setLoading(true); // Yükleme durumunu true olarak ayarlayın
      const response = await get('/api/room-permissions');
      setPermissions(response.data);
      setLoading(false); // Yükleme durumunu false olarak ayarlayın
    } catch (error) {
      console.error('Error fetching room permissions:', error);
      setLoading(false); // Yükleme durumunu false olarak ayarlayın
    }
  };

  const filteredPermissions = permissions.filter((permission) => {
    if (activeTab === 'pending') return permission.confirm_status === 0;
    if (activeTab === 'approved') return permission.confirm_status === 1;
    if (activeTab === 'rejected') return permission.confirm_status === 2;
    return true;
  });

  return (
    <div className="">
      <Breadcrumb pageName="Otaq İcazələri" />
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded-lg mr-2 ${activeTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('pending')}
        >
          İcazə gözləyənlər
        </button>
        <button
          className={`px-4 py-2 rounded-lg mr-2 ${activeTab === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('approved')}
        >
          Təsdiq olunanlar
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('rejected')}
        >
          Ləğv olunanlar
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <ClipLoader color={'#123abc'} size={50} /> {/* Bu örnek bir spinner. */}
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#e3e3e3] dark:bg-gray-800">
              <th className="py-2 px-4 border-b">Fakültə</th>
              <th className="py-2 px-4 border-b">Qrup</th>
              <th className="py-2 px-4 border-b">Otaq Nömrəsi</th>
              <th className="py-2 px-4 border-b">Müəllim</th>
              <th className="py-2 px-4 border-b">Korpus</th>
              <th className="py-2 px-4 border-b">İcazə</th>
            </tr>
          </thead>
          <tbody>
            {filteredPermissions.map((permission) => (
              <tr
                key={permission.id}
                className="hover:bg-gray-100 dark:bg-gray-700 transition-all duration-300 ease-linear"
              >
                <td className="py-2 px-4 border-b text-center">{permission.faculty.name}</td>
                <td className="py-2 px-4 border-b text-center">{permission.group.name}</td>
                <td className="py-2 px-4 border-b text-center">{permission.room.name}</td>
                <td className="py-2 px-4 border-b text-center">{permission.user.name}</td>
                <td className="py-2 px-4 border-b text-center">{permission.corp.name}</td>
                <td className="py-2 px-4 border-b text-center">
                  {hasViewPermission && (
                    <button
                      className="bg-[#d29a00] text-white p-2 rounded-lg"
                      onClick={() => navigate(`/room-permissions/${permission.id}`)}
                    >
                      <PiEyeLight className="w-3 md:w-5 h-3 md:h-5"/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoomPermissions;
