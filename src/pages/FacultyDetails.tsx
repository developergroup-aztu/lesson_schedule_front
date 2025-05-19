import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../api/service';
import Breadcrumb from './../components/Breadcrumbs/Breadcrumb';

interface Department {
  id: number;
  name: string;
  faculty_id: number;
}

interface Faculty {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  status: number;
  departments: Department[];
}

const FacultyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacultyDetails = async () => {
      try {
        const response = await get(`/api/faculties/${id}`);
        setFaculty(response.data);
      } catch (err: any) {
        console.error('Error fetching faculty details:', err);
        setError(err.message || 'An error occurred');
      }
    };

    fetchFacultyDetails();
  }, [id]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!faculty) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Breadcrumb pageName="Fakültə Detalları" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fakültə Məlumatları */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md space-y-2.5">
          <h3 className="text-xl font-semibold mb-4">Fakültə Məlumatları</h3>
          <p>
            <strong>ID:</strong> {faculty.id}
          </p>
          <p>
            <strong>Ad:</strong> {faculty.name}
          </p>
          <p>
            <strong>Yaradılma Tarixi:</strong>{' '}
            {new Date(faculty.created_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Yenilənmə Tarixi:</strong>{' '}
            {new Date(faculty.updated_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Status:</strong> {faculty.status === 1 ? 'Aktiv' : 'Passiv'}
          </p>
        </div>

        {/* Kafedralar */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Kafedralar</h3>
          {faculty.departments.length > 0 ? (
            <ul>
              {faculty.departments.map((department) => (
                <li key={department.id} className="mb-2">
                  {department.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>Kafedra yoxdur</p>
          )}
        </div>

        {/* İxtisaslar */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">İxtisaslar</h3>
          {faculty?.specialities?.length > 0 ? (
            <ul>
              {faculty?.specialities.map((specality) => (
                <li key={specality.id} className="mb-2">
                  {specality.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>İxtisas yoxdur</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDetails;
