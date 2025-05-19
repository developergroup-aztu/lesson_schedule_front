import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import Modal from 'react-modal';
import AddCourseModal from '../components/Modals/Course/AddCourseModal';
import EditCourseModal from '../components/Modals/Course/CourseEditModal';
import DeleteCourseModal from '../components/Modals/Course/CourseDeleteModal';
import { ClipLoader } from 'react-spinners';
import '../components/Modals/Modal.css';
import usePermissions from '../hooks/usePermissions';
import Swal from 'sweetalert2';


Modal.setAppElement('#root'); // Modalın accessibility üçün kök elementi təyin edin

const CoursePage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasAddPermission = usePermissions('add_course');
  const hasEditPermission = usePermissions('edit_course');
  const hasDeletePermission = usePermissions('delete_course');
  const hasViewPermission = usePermissions('view_course');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await get('/api/courses');
      const courseData = response.data;
      setCourses(courseData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddCourseModal = () => {
    setIsAddCourseModalOpen(true);
  };

  const closeAddCourseModal = () => {
    setIsAddCourseModalOpen(false);
  };

  const openEditCourseModal = (course: any) => {
    setSelectedCourse(course);
    setIsEditCourseModalOpen(true);
  };

  const closeEditCourseModal = () => {
    setIsEditCourseModalOpen(false);
    setSelectedCourse(null);
    fetchCourses(); // Kursları yenidən yüklə
  };

  const openDeleteCourseModal = (course: any) => {
    setSelectedCourse(course);
    setIsDeleteCourseModalOpen(true);
  };

  const closeDeleteCourseModal = () => {
    setIsDeleteCourseModalOpen(false);
    setSelectedCourse(null);
    fetchCourses(); // Kursları yenidən yüklə
  };

  const handleSaveCourse = async (name: string) => {
    try {
      const newCourse = { name };
      await post('/api/courses', newCourse);
      closeAddCourseModal();
      fetchCourses(); // Kursları yenidən yüklə
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleEditCourse = async (id: number, name: string) => {
    try {
      const updatedCourse = { name };
      await put(`/api/courses/${id}`, updatedCourse);
      closeEditCourseModal();
      fetchCourses(); // Kursları yenidən yüklə
    } catch (error) {
      console.error('Error editing course:', error);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await del(`/api/courses/${id}`);
      closeDeleteCourseModal();
      fetchCourses(); // Kursları yenidən yüklə
      Swal.fire({
        title: 'Silindi!',
        text: 'Kurs uğurla silindi.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      Swal.fire({
        title: 'Xəta!',
        text: error.response?.data?.message || 'Fakültəni silərkən xəta baş verdi.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Kurslar</h2>
      {hasAddPermission && (
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={openAddCourseModal}
        >
          Yeni Kurs Əlavə Et
        </button>
      )}
      {isLoading ? (
        <div className="flex justify-center items-center">
          <ClipLoader size={50} color={'#123abc'} loading={isLoading} />
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-800">
              <th className="py-2 px-4 border-b">Ad</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-gray-100 dark:bg-gray-700"
              >
                <td className="py-2 px-4 border-b text-center">
                  {course.name}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {hasEditPermission && (
                    <button
                      className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                      onClick={() => openEditCourseModal(course)}
                    >
                      <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                  {hasDeletePermission && (
                    <button
                      className="bg-red-500 text-white p-2 rounded-lg"
                      onClick={() => openDeleteCourseModal(course)}
                    >
                      <AiOutlineDelete className="w-3 md:w-5 h-3 md:h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={closeAddCourseModal}
        onSave={handleSaveCourse}
      />

      <EditCourseModal
        isOpen={isEditCourseModalOpen}
        onClose={closeEditCourseModal}
        onSave={handleEditCourse}
        course={selectedCourse}
      />

      <DeleteCourseModal
        isOpen={isDeleteCourseModalOpen}
        onClose={closeDeleteCourseModal}
        onConfirm={handleDeleteCourse}
        course={selectedCourse}
      />
    </div>
  );
};

export default CoursePage;