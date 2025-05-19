import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../api/service';

interface Group {
  id: number;
  name: string;
  student_amount: number;
  group_type: number;
  faculty_id: number;
  course_id: number;
  speciality_id: number;
  created_at: string | null;
  updated_at: string | null;
  status: number;
  group_level: number;
  faculty: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    status: number;
  };
  speciality: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    faculty_id: number;
    status: number;
  };
  course: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    status: number;
  };
}

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await get(`/api/groups/${id}`);
        setGroup(response.data);
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    };

    fetchGroup();
  }, [id]);

  if (!group) {
    return <div>Loading...</div>;
  }

  const getGroupTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return 'Əyani';
      case 2:
        return 'Qiyabi';
      default:
        return '';
    }
  };

  const getGroupLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Bakalavr';
      case 2:
        return 'Magistr';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Qrup Detalları</h2>
      <div className="mb-4">
        <strong>Ad:</strong> {group.name}
      </div>
      <div className="mb-4">
        <strong>Tələbə Sayı:</strong> {group.student_amount}
      </div>
      <div className="mb-4">
        <strong>Qrup Tipi:</strong> {getGroupTypeLabel(group.group_type)}
      </div>
      <div className="mb-4">
        <strong>Qrup Səviyyəsi:</strong> {getGroupLevelLabel(group.group_level)}
      </div>
      <div className="mb-4">
        <strong>Fakültə:</strong> {group.faculty.name}
      </div>
      <div className="mb-4">
        <strong>İxtisas:</strong> {group.speciality.name}
      </div>
      <div className="mb-4">
        <strong>Kurs:</strong> {group.course.name}
      </div>
    </div>
  );
};

export default GroupDetails;