import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import ClipLoader from 'react-spinners/ClipLoader';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../hooks/usePermissions';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import ServerError from './Common/500';
// import { AiOutlineDelete } from 'react-icons/ai';
// import { FaRegEdit } from 'react-icons/fa';
// import { PiEyeLight } from 'react-icons/pi';
// import DeleteDepartmentModal from './../components/Modals/Department/DeleteDepartmentModal';
// import AddDepartmentModal from './../components/Modals/Department/AddDepartmentModal';
// import EditDepartmentModal from './../components/Modals/Department/EditDepartment';
// import Swal from 'sweetalert2';


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

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  // const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  // const [isEditDepartmentModalOpen, setIsEditDepartmentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasServerError, setHasServerError] = useState(false); // 500 xətası üçün state
  // const navigate = useNavigate();

  // const hasAddPermission = usePermissions('add_department');
  // const hasEditPermission = usePermissions('edit_department');
  // const hasDeletePermission = usePermissions('delete_department');
  // const hasViewPermission = usePermissions('view_department');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await get('/api/departments');
      
      // Check if response.data is an array and handle accordingly
      if (Array.isArray(response.data)) {
        setDepartments(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Sometimes API responses nest data in a 'data' property
        setDepartments(response.data.data);
      } else {
        // If not an array, set as empty array to prevent map errors
        console.error('Unexpected API response format:', response);
        setDepartments([]);
      }
      
      setHasServerError(false); // Xəta olmadıqda
    } catch (error) {
      console.error('Error fetching departments:', error);
      setHasServerError(true); // 500 xətası baş verdikdə
      setDepartments([]); // Ensure departments is an array even on error
    } finally {
      setLoading(false);
    }
  };

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
      <Breadcrumb pageName="Kafedralar" />

      {/* {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={() => setIsAddDepartmentModalOpen(true)}
        >
          Yeni Kafedra Əlavə Et
        </button>
      )} */}
      <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-800">
                <th className="py-2 px-4 border-b">Ad</th>
                <th className="py-2 px-4 border-b">Fakültə</th>
              </tr>
            </thead>
            <tbody>
              {departments.length > 0 ? (
                departments.map((department) => (
                  <tr
                    key={department.id}
                    className="hover:bg-gray-100 dark:bg-gray-700"
                  >
                    <td className="py-2 px-4 border-b text-center">
                      {department.name}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {department.faculty?.name || '-'}
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
    </div>
  
  );
};

export default Departments;