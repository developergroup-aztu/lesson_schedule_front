import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../api/service';
import ClipLoader from 'react-spinners/ClipLoader';

interface Discipline {
  id: number;
  name: string;
}

interface Faculty {
  id: number;
  name: string;
}


interface Department {
  id: number;
  name: string;
  faculty_id: number;
  created_at: string;
  updated_at: string;
  status: number;
  faculty: Faculty;
  disciplines: Discipline[];
}

const DepartmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setLoading(true);
        const response = await get(`/api/departments/${id}`);
        setDepartment(response.data);
      } catch (error) {
        console.error('Error fetching department:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  if (!department) {
    return <div className="text-center mt-10">Kafedra tapılmadı</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Kafedra Məlumatları</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="text-xl font-bold mb-4">Kafedra Məlumatları</h3>
          <p><strong>Ad:</strong> {department.name}</p>
          <p><strong>Fakültə:</strong> {department.faculty.name}</p>
          <p><strong>Yaradılma Tarixi:</strong> {new Date(department.created_at).toLocaleDateString()}</p>
          <p><strong>Yenilənmə Tarixi:</strong> {new Date(department.updated_at).toLocaleDateString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="text-xl font-bold mb-4">Fənlər</h3>
          {department.disciplines.length > 0 ? (
            <ul>
              {department.disciplines.map((discipline) => (
                <li key={discipline.id}>{discipline.name}</li>
              ))}
            </ul>
          ) : (
            <p>Fənn yoxdur</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetails;