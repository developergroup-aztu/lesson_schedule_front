import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import Breadcrumb from './../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import ServerError from './Common/500';
import ClipLoader from 'react-spinners/ClipLoader';
// import AddFacultyModal from '../components/Modals/Faculty/AddFacultyModal';
// import DeleteFacultyModal from '../components/Modals/Faculty/DeleteFacultyModal';
// import { AiOutlineDelete } from 'react-icons/ai';
// import { FaRegEdit } from 'react-icons/fa';
// import { PiEyeLight } from 'react-icons/pi';
// import usePermissions from '../hooks/usePermissions';
// import { useNavigate } from 'react-router-dom';

interface Faculty {
  id: number;
  name: string;
  departments: Department[];
}

interface Department {
  id: number;
  name: string;
  faculty_id: number;
}

const FacultyPage: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [editFacultyId, setEditFacultyId] = useState<number | null>(null);
  const [editFacultyName, setEditFacultyName] = useState('');
  const [facultyToDelete, setFacultyToDelete] = useState<number | null>(null);
  const [hasServerError, setHasServerError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const navigate = useNavigate();

  // const hasAddPermission = usePermissions('add_faculty');
  // const hasEditPermission = usePermissions('edit_faculty');
  // const hasDeletePermission = usePermissions('delete_faculty');
  // const hasViewPermission = usePermissions('view_faculty');

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await get('/api/faculties');
      
      // Check if response.data is an array and handle accordingly
      if (Array.isArray(response.data)) {
        setFaculties(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Sometimes API responses nest data in a 'data' property
        setFaculties(response.data.data);
      } else {
        // If not an array, set as empty array to prevent map errors
        console.error('Unexpected API response format:', response);
        setFaculties([]);
      }
      
      setHasServerError(false); // Xəta olmadıqda
    } catch (err: any) {
      console.error('Error fetching faculties:', err);
      setError(err.message || 'An error occurred');
      setHasServerError(true); // 500 xətası baş verdikdə
      setFaculties([]); // Ensure faculties is an array even on error
    } finally {
      setLoading(false); // Veri yüklendikten sonra loading state'ini false yap
    }
  };

  const handleAddFaculty = async (name: string) => {
    try {
      await post('/api/faculties', { name });
      // setIsAddModalOpen(false);
      fetchFaculties();
    } catch (err: any) {
      console.error('Error adding faculty:', err);
      setError(err.message || 'An error occurred');
    }
  };

  const handleEditFaculty = async () => {
    if (editFacultyId !== null) {
      try {
        await put(`/api/faculties/${editFacultyId}`, { name: editFacultyName });
        setEditFacultyId(null);
        setEditFacultyName('');
        fetchFaculties();
      } catch (err: any) {
        console.error('Error editing faculty:', err);
        setError(err.message || 'An error occurred');
      }
    }
  };

  const handleDeleteFaculty = async () => {
    if (facultyToDelete !== null) {
      try {
        const response = await del(`/api/faculties/${facultyToDelete}`);
        setFacultyToDelete(null);
        // setIsDeleteModalOpen(false);
        fetchFaculties();
        Swal.fire({
          title: 'Silindi!',
          text: 'Fakültə uğurla silindi.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } catch (err: any) {
        console.error('Error deleting faculty:', err);
        setError(err.message || 'An error occurred');
        Swal.fire({
          title: 'Xəta!',
          text: err.response?.data?.message || 'Fakültəni silərkən xəta baş verdi.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  if (hasServerError) {
    return (
      <div className="flex items-center justify-center ">
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
      <Breadcrumb pageName="Fakültələr" />
      {/* {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={() => setIsAddModalOpen(true)}
        >
          Yeni Fakültə Əlavə Et
        </button>
      )} */}
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-[#e3e3e3] dark:bg-gray-800">
            <th className="py-2 px-4 border-b">Fakültə</th>
            <th className="py-2 px-4 border-b">Kafedralar</th>
          </tr>
        </thead>
        <tbody>
          {faculties.length > 0 ? (
            faculties.map((faculty) => (
              <tr
                key={faculty.id}
                className="hover:bg-gray-100 dark:bg-gray-700 transition-all duration-300 ease-linear"
              >
                <td className="py-2 px-4 border-b text-center">
                  {editFacultyId === faculty.id ? (
                    <input
                      type="text"
                      value={editFacultyName}
                      onChange={(e) => setEditFacultyName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  ) : (
                    faculty.name
                  )}
                </td>

                <td className="py-2 px-4 border-b text-center">
                  {faculty.departments && faculty.departments.length > 0 
                    ? faculty.departments
                      .slice(0, 2)
                      .map((department) => department.name)
                      .join(', ') + (faculty.departments.length > 2 ? '...' : '')
                    : '-'
                  }
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="py-4 text-center">
                Məlumat tapılmadı
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyPage;