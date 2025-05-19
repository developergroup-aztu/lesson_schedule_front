import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import AddLessonModal from '../components/Modals/Lesson/AddLessonType';
import EditLessonModal from '../components/Modals/Lesson/EditLessonType';
import DeleteLessonModal from '../components/Modals/Lesson/DeleteLessonType';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import usePermissions from '../hooks/usePermissions';
import Swal from 'sweetalert2';


interface Lesson {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  status: number;
}

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);

  const hasAddPermission = usePermissions('add_lesson_type');
  const hasEditPermission = usePermissions('edit_lesson_type');
  const hasDeletePermission = usePermissions('delete_lesson_type');
  const hasViewPermission = usePermissions('view_lesson_type');

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await get('/api/lesson_types');
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedLesson) {
      try {
        await del(`/api/lesson_types/${selectedLesson.id}`);
        setLessons(lessons.filter((lesson) => lesson.id !== selectedLesson.id));
        closeDeleteModal();
        Swal.fire({
          title: 'Silindi!',
          text: 'Dərs tipi uğurla silindi.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Error deleting lesson:', error);
        Swal.fire({
          title: 'Xəta!',
          text: error.response?.data?.message || 'Fakültəni silərkən xəta baş verdi.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const openDeleteModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedLesson(null);
    setIsDeleteModalOpen(false);
  };

  const openAddLessonModal = () => {
    setSelectedLesson(null);
    setIsAddLessonModalOpen(true);
  };

  const closeAddLessonModal = () => {
    setSelectedLesson(null);
    setIsAddLessonModalOpen(false);
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsEditLessonModalOpen(true);
  };

  const closeEditLessonModal = () => {
    setSelectedLesson(null);
    setIsEditLessonModalOpen(false);
  };

  const handleSaveLesson = async (name: string) => {
    try {
      if (selectedLesson) {
        await put(`/api/lesson_types/${selectedLesson.id}`, { name });
        setLessons(
          lessons.map((lesson) =>
            lesson.id === selectedLesson.id ? { ...lesson, name } : lesson,
          ),
        );
      } else {
        await post('/api/lesson_types', { name });
        fetchLessons(); // Yeni ders eklendikten sonra tabloyu yenile
      }
      closeAddLessonModal();
      closeEditLessonModal();
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Dərs tipi</h2>
      {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={openAddLessonModal}
        >
          Yeni Dərs tipi Əlavə Et
        </button>
      )}
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200  dark:bg-gray-800">
            <th className="py-2 px-4 border-b">Ad</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.id} className="hover:bg-gray-100  dark:bg-gray-700">
              <td className="py-2 px-4 border-b text-center">{lesson.name}</td>
              <td className="py-2 px-4 border-b text-center">
                {hasEditPermission && (
                  <button
                    className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                    onClick={() => openEditLessonModal(lesson)}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DeleteLessonModal
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
            name: selectedLesson.name,
          }}
        />
      )}
    </div>
  );
};

export default Lessons;