import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import ServerError from './Common/500';
import { ClipLoader } from 'react-spinners';
// import { useNavigate } from 'react-router-dom';
// import usePermissions from '../hooks/usePermissions';


interface Speciality {
  id: number;
  name: string;
  faculty_id: number;
  faculty: {
    id: number;
    name: string;
    faculty_code: string;
  };
}

const Specialities: React.FC = () => {
  // const navigate = useNavigate();
  // const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  // const [specialityToDelete, setSpecialityToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasServerError, setHasServerError] = useState(false); // 500 xətası üçün state
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [loading, setLoading] = useState(true); // Loading state

  // const hasAddPermission = usePermissions('add_speciality');
  // const hasEditPermission = usePermissions('edit_speciality');
  // const hasDeletePermission = usePermissions('delete_speciality');
  // const hasViewPermission = usePermissions('view_speciality');

  const fetchSpecialities = async () => {
    try {
      const response = await get('/api/specialities');
      setSpecialities(response.data);
      setHasServerError(false); // Xəta olmadıqda
    } catch (err: any) {
      console.error('Error fetching specialities:', err);
      setError(err.message || 'An error occurred');
      setHasServerError(true); // 500 xətası baş verdikdə
    }
    finally {
      setLoading(false); // Veri yüklendikten sonra loading state'ini false yap
    }
  };

  useEffect(() => {
    fetchSpecialities();
  }, []);

  // const handleAddSpeciality = async (name: string, facultyId: number) => {
  //   try {
  //     await post('/api/specialities', { name, faculty_id: facultyId });
  //     // setIsAddModalOpen(false);
  //     fetchSpecialities();
  //   } catch (err: any) {
  //     console.error('Error adding speciality:', err);
  //     setError(err.message || 'An error occurred');
  //   }
  // };

  // const handleDeleteSpeciality = async () => {
  //   if (specialityToDelete !== null) {
  //     try {
  //       await del(`/api/specialities/${specialityToDelete}`);
  //       setSpecialities(
  //         specialities.filter(
  //           (speciality) => speciality.id !== specialityToDelete,
  //         ),
  //       );
  //       setSpecialityToDelete(null);
  //       setIsDeleteModalOpen(false);
  //     } catch (err: any) {
  //       console.error('Error deleting speciality:', err);
  //       setError(err.message || 'An error occurred');
  //     }
  //   }
  // };

  if (hasServerError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ServerError />
      </div>
    );
  }

    if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  return (
    <div className="">
      <Breadcrumb pageName="İxtisas" />

      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-800">
              <th className="py-2 px-4 border-b">İxtisas</th>
              <th className="py-2 px-4 border-b">Fakültə</th>
            </tr>
          </thead>
          <tbody>
            {specialities.map((speciality) => (
              <tr
                key={speciality.id}
                className="hover:bg-gray-100 dark:bg-gray-700 transition-all duration-300 ease-linear"
              >
                <td className="py-2 px-4 border-b text-center">
                  {speciality.name}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {speciality.faculty?.name || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Specialities;