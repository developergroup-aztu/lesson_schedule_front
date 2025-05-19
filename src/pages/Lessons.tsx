import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import AddLessonModal from '../components/Modals/Lesson/AddLesson';
import EditLessonModal from '../components/Modals/Lesson/EditLesson';
import DeleteLessonModal from '../components/Modals/Lesson/DeleteLesson';
import ClipLoader from 'react-spinners/ClipLoader';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegEdit } from 'react-icons/fa';
import usePermissions from '../hooks/usePermissions';
import Swal from 'sweetalert2';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';


interface Lesson {
  id: number;
  name: string;
  department: {
    id: number;
    name: string;
  };
}

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  // const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);

  // const hasAddPermission = usePermissions('add_discipline');
  // const hasEditPermission = usePermissions('edit_discipline');
  // const hasDeletePermission = usePermissions('delete_discipline');
  // const hasViewPermission = usePermissions('view_discipline');

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await get('/api/disciplines');
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

    if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }
  

  // const handleEdit = (lesson: Lesson) => {
  //   setSelectedLesson(lesson);
  //   setIsEditLessonModalOpen(true);
  // };

  // const handleDelete = async () => {
  //   if (selectedLesson) {
  //     try {
  //       await del(`/api/disciplines/${selectedLesson.id}`);
  //       setLessons(lessons.filter((l) => l.id !== selectedLesson.id));
  //       closeDeleteModal();
  //       Swal.fire({
  //         title: 'Silindi!',
  //         text: 'Fənn uğurla silindi.',
  //         icon: 'success',
  //         confirmButtonText: 'OK'
  //       });
  //     } catch (error) {
  //       console.error('Error deleting lesson:', error);
  //       Swal.fire({
  //         title: 'Xəta!',
  //         text: error.response?.data?.message || 'Fakültəni silərkən xəta baş verdi.',
  //         icon: 'error',
  //         confirmButtonText: 'OK'
  //       });
  //     }
  //   }
  // };

  // const openDeleteModal = (lesson: Lesson) => {
  //   setSelectedLesson(lesson);
  //   setIsDeleteModalOpen(true);
  // };

  // const closeDeleteModal = () => {
  //   setSelectedLesson(null);
  //   setIsDeleteModalOpen(false);
  // };

  // const openAddLessonModal = () => {
  //   setSelectedLesson(null);
  //   setIsAddLessonModalOpen(true);
  // };

  // const closeAddLessonModal = () => {
  //   setSelectedLesson(null);
  //   setIsAddLessonModalOpen(false);
  // };

  // const closeEditLessonModal = () => {
  //   setSelectedLesson(null);
  //   setIsEditLessonModalOpen(false);
  // };

  // const handleSaveLesson = async (name: string, department_id: number) => {
  //   try {
  //     if (selectedLesson) {
  //       await put(`/api/disciplines/${selectedLesson.id}`, {
  //         name,
  //         department_id,
  //       });
  //       setLessons(
  //         lessons.map((l) =>
  //           l.id === selectedLesson.id
  //             ? {
  //                 ...l,
  //                 name,
  //                 department: { ...l.department, id: department_id },
  //               }
  //             : l,
  //         ),
  //       );
  //     } else {
  //       const response = await post('/api/disciplines', { name, department_id });
  //       setLessons([...lessons, response.data]);
  //     }
  //     closeAddLessonModal();
  //     closeEditLessonModal();
  //     fetchLessons();
  //   } catch (error) {
  //     console.error('Error saving lesson:', error);
  //   }
  // };

  return (
    <div className="">
       <Breadcrumb pageName="Fənnlər" />
      {/* {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg mb-4"
          onClick={openAddLessonModal}
        >
          Yeni Fənn Əlavə Et
        </button>
      )} */}
      <div className="overflow-x-auto">
       
          <table className="min-w-full bg-white text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-800">
                <th className="py-2 px-2 md:py-2 md:px-4 border-b">Ad</th>
                <th className="py-2 px-2 md:py-2 md:px-4 border-b">Kafedra</th>
                {/* <th className="py-2 px-2 md:py-2 md:px-4 border-b">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr
                  key={lesson.id}
                  className="hover:bg-gray-100 dark:bg-gray-700"
                >
                  <td className="py-2 px-2 md:py-2 md:px-4 border-b text-center">
                    {lesson.name}
                  </td>
                  <td className="py-2 px-2 md:py-2 md:px-4 border-b text-center">
                    {lesson.department.name}
                  </td>
                  {/* <td className="py-2  px-2 border-b text-center">
                    <div>
                      {hasEditPermission && (
                        <button
                          className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                          onClick={() => handleEdit(lesson)}
                        >
                          <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          className="bg-red-500 text-white p-2 rounded-lg"
                          onClick={() => openDeleteModal(lesson)}
                        >
                          <AiOutlineDelete className="w-3 md:w-5 h-3 md:h-5" />
                        </button>
                      )}
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* <DeleteLessonModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <AddLessonModal
        isOpen={isAddLessonModalOpen}
        onClose={closeAddLessonModal}
        onSave={handleSaveLesson}
      />

      {selectedLesson && (
        <EditLessonModal
          isOpen={isEditLessonModalOpen}
          onClose={closeEditLessonModal}
          onSave={handleSaveLesson}
          initialData={{
            id: selectedLesson.id,
            name: selectedLesson.name,
            department_id: selectedLesson.department.id,
          }}
        />
      )} */}
    </div>
  );
};

export default Lessons;