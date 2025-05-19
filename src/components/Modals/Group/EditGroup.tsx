import React, { useState, useEffect } from 'react';
import { get, put } from '../../../api/service';

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

interface EditGroupModalProps {
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
  initialData: {
    id: number;
    name: string;
    studentAmount: number;
    groupType: number;
    groupLevel: number;
    facultyId: number;
    courseId: number;
    specialityId: number;
  };
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData.name);
  const [studentAmount, setStudentAmount] = useState(initialData.studentAmount);
  const [groupType, setGroupType] = useState<number | ''>(initialData.groupType);
  const [groupLevel, setGroupLevel] = useState<number | ''>(initialData.groupLevel);
  const [facultyId, setFacultyId] = useState<number | ''>(initialData.facultyId);
  const [courseId, setCourseId] = useState<number | ''>(initialData.courseId);
  const [specialityId, setSpecialityId] = useState<number | ''>(initialData.specialityId);
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
    if (isOpen) {
      setName(initialData.name);
      setStudentAmount(initialData.studentAmount);
      setGroupType(initialData.groupType);
      setGroupLevel(initialData.groupLevel);
      setFacultyId(initialData.facultyId);
      setCourseId(initialData.courseId);
      setSpecialityId(initialData.specialityId);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (facultyId) {
      setFilteredSpecialities(specialities.filter(speciality => speciality.faculty_id === Number(facultyId)));
    } else {
      setFilteredSpecialities([]);
    }
  }, [facultyId, specialities]);

  const handleSubmit = async () => {
    try {
      await put(`/api/groups/${initialData.id}`, {
        name,
        student_amount: studentAmount,
        group_type: Number(groupType),
        group_level: Number(groupLevel),
        faculty_id: Number(facultyId),
        course_id: Number(courseId),
        speciality_id: Number(specialityId),
      });
      onSave(
        name,
        studentAmount,
        Number(groupType),
        Number(groupLevel),
        Number(facultyId),
        Number(courseId),
        Number(specialityId)
      );
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full sm:w-2/3 md:w-1/2 lg:w-1/3 p-6 rounded-lg shadow-lg overflow-y-auto max-h-full">
        <h2 className="text-xl font-bold mb-4">Qrupu Redaktə Et</h2>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Ad
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="studentAmount"
            className="block text-sm font-medium text-gray-700"
          >
            Tələbə Sayı
          </label>
          <input
            id="studentAmount"
            name="studentAmount"
            type="number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={studentAmount}
            onChange={(e) => setStudentAmount(Number(e.target.value))}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="groupType"
            className="block text-sm font-medium text-gray-700"
          >
            Qrup Tipi
          </label>
          <select
            id="groupType"
            name="groupType"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={groupType}
            onChange={(e) => setGroupType(Number(e.target.value))}
          >
            <option value="">Seçin</option>
            <option value={1}>Əyani</option>
            <option value={2}>Qiyabi</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="groupLevel"
            className="block text-sm font-medium text-gray-700"
          >
            Qrup Səviyyəsi
          </label>
          <select
            id="groupLevel"
            name="groupLevel"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={groupLevel}
            onChange={(e) => setGroupLevel(Number(e.target.value))}
          >
            <option value="">Seçin</option>
            <option value={1}>Bakalavr</option>
            <option value={2}>Magistr</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="faculty"
            className="block text-sm font-medium text-gray-700"
          >
            Fakültə
          </label>
          <select
            id="faculty"
            name="faculty"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="block text-sm font-medium text-gray-700"
          >
            Kurs
          </label>
          <select
            id="course"
            name="course"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="block text-sm font-medium text-gray-700"
          >
            İxtisas
          </label>
          <select
            id="speciality"
            name="speciality"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition duration-200"
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            type="button"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            onClick={handleSubmit}
          >
            Təsdiq et
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupModal;