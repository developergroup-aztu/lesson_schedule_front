import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../api/service';

interface Speciality {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
  specialty: Speciality;
}

const CourseSpecialitiesPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await get(`/api/course/${courseId}`);
        setCourse(response.data);
      } catch (err: any) {
        console.error('Error fetching course:', err);
        setError(err.message || 'An error occurred');
      }
    };

    fetchCourse();
  }, [courseId]);

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">{course?.name} Kursunun İxtisasları</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {course && (
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#e3e3e3]  dark:bg-gray-800">
              <th className="py-2 px-4 border-b">İxtisas</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-100 transition-all duration-300 ease-linear  dark:bg-gray-700">
              <td className="py-2 px-4 border-b text-center">{course.specialty.name}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CourseSpecialitiesPage;