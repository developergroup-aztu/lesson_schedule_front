import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { get, post } from '../api/service';
import Breadcrumb from './../components/Breadcrumbs/Breadcrumb';
import usePermissions from '../hooks/usePermissions';

interface Permission {
  faculty: { name: string };
  group: { name: string };
  corp: { name: string };
  room: { name: string };
  department: { name: string };
  user: { name: string };
  lesson_type: { name: string };
  lesson_type_hour: { hour: string };
  discipline: { name: string };
  semester: { year: number; semester_num: number };
  week_type: { name: string };
  day: { name: string };
  hour: { name: string };
}

const RoomPermissionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [permission, setPermission] = useState<Permission | null>(null);
  const navigate = useNavigate();

  const hasConfirmPermission = usePermissions('confirm_room_permission');

  useEffect(() => {
    fetchPermissionDetails();
  }, []);

  const fetchPermissionDetails = async () => {
    try {
      const response = await get(`/api/room-permissions/${id}`);
      setPermission(response.data);
    } catch (error) {
      console.error('Error fetching room permission details:', error);
    }
  };

  const handleApprove = async () => {
    try {
      await post('/api/room-permissions', {
        schedule_id: parseInt(id, 10),
        reply: 1,
      });
      Swal.fire('İcazə verildi!', 'Otaq icazəsi təsdiqləndi.', 'success');
      navigate('/room-permissions');
    } catch (error) {
      console.error('Error approving room permission:', error);
      Swal.fire('Xəta!', 'Otaq icazəsi təsdiqlənərkən xəta baş verdi.', 'error');
    }
  };

  const handleReject = async () => {
    try {
      await post('/api/room-permissions', {
        schedule_id: parseInt(id, 10),
        reply: 2,
      });
      Swal.fire('Rədd edildi!', 'Otaq icazəsi rədd edildi.', 'success');
      navigate('/room-permissions');
    } catch (error) {
      console.error('Error rejecting room permission:', error);
      Swal.fire('Xəta!', 'Otaq icazəsi rədd edilərkən xəta baş verdi.', 'error');
    }
  };

  const dayNameHelper = (dayNumber: string): string => {
    const days = {
      "1": "Bazar ertəsi",
      "2": "Çərşənbə axşamı",
      "3": "Çərşənbə",
      "4": "Cümə axşamı",
      "5": "Cümə",
      "6": "Şənbə",
      "7": "Bazar"
    };
    return days[dayNumber] || "Naməlum gün";
  };

  if (!permission) {
    return <div>Yüklənir...</div>;
  }

  return (
    <div className="">
      <Breadcrumb pageName="Otaq İcazə Detalları" />
      <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4">Otaq İcazə Detalları</h2>
        <p><strong>Fakültə:</strong> {permission.faculty.name}</p>
        <p><strong>Qrup:</strong> {permission.group.name}</p>
        <p><strong>Korpus:</strong> {permission.corp.name}</p>
        <p><strong>Otaq Nömrəsi:</strong> {permission.room.name}</p>
        <p><strong>Kafedra:</strong> {permission.department.name}</p>
        <p><strong>İstifadəçi:</strong> {permission.user.name}</p>
        <p><strong>Dərs tipi:</strong> {permission.lesson_type.name}</p>
        <p><strong>Dərsin saatı:</strong> {permission.lesson_type_hour.hour}</p>
        <p><strong>Dərs:</strong> {permission.discipline.name}</p>
        <p><strong>Semestrlər:</strong> {permission.semester.year} ({permission.semester.semester_num})</p>
        <p><strong>Həftə tipi:</strong> {permission.week_type.name}</p>
        <p><strong>Gün:</strong> {dayNameHelper(permission.day.name)}</p>
        <p><strong>Saat:</strong> {permission.hour.name}</p>
        {
          permission.confirm_status === 2 ? (null) : (
            hasConfirmPermission &&  (
              <div className="mt-4">
                <button
                  className="bg-green-500 text-white p-2 rounded-lg mr-2"
                  onClick={handleApprove}
                >
                  Təsdiqlə
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded-lg"
                  onClick={handleReject}
                >
                  Rədd et
                </button>
              </div>
            )
          )
        }

      </div>
    </div>
  );
};

export default RoomPermissionDetails;