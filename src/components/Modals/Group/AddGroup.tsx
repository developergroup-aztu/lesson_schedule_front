import React, { useState, useEffect } from 'react';
import { get, post } from '../../../api/service';

interface Faculty {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

interface Speciality {
  id: number;
  name: string;
  faculty_id: number;
}

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    studentAmount: number,
    groupType: number,
    groupLevel: number,
    facultyId: number,
    courseId: number,
    specialityId: number
  ) => void;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [studentAmount, setStudentAmount] = useState(0);
  const [groupType, setGroupType] = useState<string>('');
  const [groupLevel, setGroupLevel] = useState<string>('');
  const [facultyId, setFacultyId] = useState<number | ''>('');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [specialityId, setSpecialityId] = useState<number | ''>('');
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [filteredSpecialities, setFilteredSpecialities] = useState<Speciality[]>([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await get('/api/faculties');
        setFaculties(response.data);
      } catch (error) {
        console.error('Error fetching faculties:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await get('/api/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const fetchSpecialities = async () => {
      try {
        const response = await get('/api/specialities');
        setSpecialities(response.data);
      } catch (error) {
        console.error('Error fetching specialities:', error);
      }
    };

    if (isOpen) {
      fetchFaculties();
      fetchCourses();
      fetchSpecialities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (facultyId) {
      setFilteredSpecialities(specialities.filter(speciality => speciality.faculty_id === Number(facultyId)));
    } else {
      setFilteredSpecialities([]);
    }
  }, [facultyId, specialities]);

  const handleSubmit = async () => {
    try {
      await post('/api/groups', {
        name,
        student_amount: studentAmount,
        group_type: groupType === 'Əyani' ? 1 : 2,
        group_level: groupLevel === 'Bakalavr' ? 1 : 2,
        faculty_id: Number(facultyId),
        course_id: Number(courseId),
        speciality_id: Number(specialityId),
      });
      onSave(
        name,
        studentAmount,
        groupType === 'Əyani' ? 1 : 2,
        groupLevel === 'Bakalavr' ? 1 : 2,
        Number(facultyId),
        Number(courseId),
        Number(specialityId)
      );
      setName('');
      setStudentAmount(0);
      setGroupType('');
      setGroupLevel('');
      setFacultyId('');
      setCourseId('');
      setSpecialityId('');
      onClose();
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full sm:w-2/3 md:w-1/2 lg:w-1/3 overflow-y-auto max-h-full">
        <h2 className="text-xl font-bold mb-4">Yeni Qrup Əlavə Et</h2>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Ad
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="mt-1 block w-full px-3 py-2 dark:bg-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="studentAmount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Tələbə Sayı
          </label>
          <input
            id="studentAmount"
            name="studentAmount"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="mt-1 block w-full px-3 py-2 dark:bg-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={studentAmount}
            onChange={(e) => setStudentAmount(Number(e.target.value))}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="groupType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Qrup Tipi
          </label>
          <select
            id="groupType"
            name="groupType"
            className="mt-1 block w-full px-3 py-2 dark:bg-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={groupType}
            onChange={(e) => setGroupType(e.target.value)}
          >
            <option value="">Seçin</option>
            <option value="Əyani">Əyani</option>
            <option value="Qiyabi">Qiyabi</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="groupLevel"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Qrup Səviyyəsi
          </label>
          <select
            id="groupLevel"
            name="groupLevel"
            className="mt-1 block w-full px-3 py-2 dark:bg-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={groupLevel}
            onChange={(e) => setGroupLevel(e.target.value)}
          >
            <option value="">Seçin</option>
            <option value="Bakalavr">Bakalavr</option>
            <option value="Magistr">Magistr</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="faculty"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Fakültə
          </label>
          <select
            id="faculty"
            name="faculty"
            className="mt-1 block w-full px-3 py-2 dark:bg-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={facultyId}
            onChange={(e) => setFacultyId(Number(e.target.value))}
          >
            <option value="">Seçin</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="course"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Kurs
          </label>
          <select
            id="course"
            name="course"
            className="mt-1 block w-full px-3 py-2 dark:bg-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={courseId}
            onChange={(e) => setCourseId(Number(e.target.value))}
          >
            <option value="">Seçin</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="speciality"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            İxtisas
          </label>
          <select
            id="speciality"
            name="speciality"
            className="mt-1 block w-full px-3 py-2 dark:bg-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={specialityId}
            onChange={(e) => setSpecialityId(Number(e.target.value))}
          >
            <option value="">Seçin</option>
            {filteredSpecialities.map((speciality) => (
              <option key={speciality.id} value={speciality.id}>
                {speciality.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            type="button"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            onClick={handleSubmit}
          >
            Təsdiq et
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupModal;

