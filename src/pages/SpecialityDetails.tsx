import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../api/service';
import Breadcrumb from './../components/Breadcrumbs/Breadcrumb';

interface Speciality {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  status: number;
  faculty: {
    id: number;
    name: string;
  };
  groups: {
    id: number;
    name: string;
    student_amount: number;
    group_type: number;
    group_level: number;
  }[];
}

const SpecialityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [speciality, setSpeciality] = useState<Speciality | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialityDetails = async () => {
      try {
        const response = await get(`/api/specialities/${id}`);
        setSpeciality(response.data);
      } catch (err: any) {
        console.error('Error fetching speciality details:', err);
        setError(err.message || 'An error occurred');
      }
    };

    fetchSpecialityDetails();
  }, [id]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!speciality) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Breadcrumb pageName="İxtisas Detalları" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* İxtisas Məlumatları */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-2.5">
          <h3 className="text-xl font-semibold mb-4">İxtisas Məlumatları</h3>
          <p>
            <strong>ID:</strong> {speciality.id}
          </p>
          <p>
            <strong>Ad:</strong> {speciality.name}
          </p>
          <p>
            <strong>Fakültə:</strong> {speciality.faculty.name}
          </p>
          <p>
            <strong>Status:</strong> {speciality.status === 1 ? 'Aktiv' : 'Passiv'}
          </p>
          <p>
            <strong>Yaradılma Tarixi:</strong>{' '}
            {new Date(speciality.created_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Yenilənmə Tarixi:</strong>{' '}
            {new Date(speciality.updated_at).toLocaleDateString()}
          </p>
        </div>

        {/* Qruplar */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Qruplar</h3>
          {speciality.groups.length > 0 ? (
            <ul>
              {speciality.groups.map((group) => (
                <li key={group.id} className="mb-2">
                  {group.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>Qrup yoxdur</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialityDetails;