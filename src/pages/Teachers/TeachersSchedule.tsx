import React, { useEffect, useState } from 'react';
import { get } from '../../api/service';
import { useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { Users, BookOpenText } from 'lucide-react';
import Swal from 'sweetalert2';

// Gün adları
const dayNames = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə'];

// Saat intervalları
const timeSlots = [
  '09:00-10:20',
  '10:30-11:50', 
  '12:00-13:20',
  '13:35-14:55',
  '15:05-16:25',
  '16:35-17:55'
];

// Interfeyslər
interface Group {
  group_id: number;
  group_name: string;
}

interface Lesson {
  schedule_group_id: number;
  schedule_id: number;
  lesson_id: number;
  lesson_name: string;
  lesson_type_id: number;
  lesson_type_name: string;
  week_type_id: number;
  week_type_name: string;
  room_id: number;
  room_name: string;
  corp_id: number;
  lock_id: number;
  groups: Group[];
}

interface Hour {
  hour_id: number;
  hour_name: string;
  lessons: Lesson[];
}

interface Day {
  day_id: number;
  hours: Hour[];
}

interface TeacherScheduleData {
  teacher_code: string;
  teacher_name: string;
  teacher_surname: string;
  days: Day[];
}

const TeacherSchedule: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [teacherData, setTeacherData] = useState<TeacherScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await get(`/api/teachers/${id}`);
        if (res.data) {
          setTeacherData(res.data);
        } else {
          setError('Müəllim cədvəli tapılmadı');
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Xəta baş verdi';
        setError(msg);
        Swal.fire({
          icon: 'error',
          title: 'Xəta',
          text: msg,
          confirmButtonColor: '#3b82f6',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherSchedule();
  }, [id]);

  // Bir dərs blokunu render etmək
  const renderSingleLesson = (lesson: Lesson, isHalf: boolean = false) => {
    const allGroups = lesson.groups.map(g => g.group_name);
    const uniqueGroups = [...new Set(allGroups)].sort();

    let bgColor = 'bg-gray-50';
    let textColor = 'text-gray-700';
    let borderColor = 'border-gray-200';

    if (lesson.week_type_name === 'daimi') {
      bgColor = 'bg-green-50';
      textColor = 'text-green-800';
      borderColor = 'border-green-200';
    } else if (lesson.week_type_name === 'üst həftə') {
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-800';
      borderColor = 'border-blue-200';
    } else if (lesson.week_type_name === 'alt həftə') {
      bgColor = 'bg-purple-50';
      textColor = 'text-purple-800';
      borderColor = 'border-purple-200';
    }

    const textSize = isHalf ? 'text-xs' : 'text-sm';
    const fontWeight = isHalf ? 'font-medium' : 'font-semibold';

    return (
      <div className={`${bgColor} ${borderColor} border rounded p-2 h-full`}>
        <div className={`${textColor} ${fontWeight} ${textSize} mb-1`}>
          {lesson.lesson_name}
        </div>
        <div className="text-xs text-gray-600 mb-1">
          {lesson.lesson_type_name}
        </div>
        <div className="flex items-center gap-1 mb-1">
          <Users size={10} />
          <span className="text-xs text-gray-700">
            {uniqueGroups.join(', ')}
          </span>
        </div>
        <div className="text-xs text-gray-600 mb-1">
          {lesson.corp_id} - {lesson.room_name}
        </div>
        <div className="text-xs text-gray-500">
          {lesson.week_type_name}
        </div>
      </div>
    );
  };

  // Dərs blokunu render etmək
  const renderLesson = (lessons: Lesson[]) => {
    if (!lessons || lessons.length === 0) {
      return <span className="text-gray-400 text-sm">-</span>;
    }

    // Dərəsləri həftə tipinə görə qruplaşdır
    const daimiLessons = lessons.filter(l => l.week_type_name === 'daimi');
    const upperWeekLessons = lessons.filter(l => l.week_type_name === 'üst həftə');
    const lowerWeekLessons = lessons.filter(l => l.week_type_name === 'alt həftə');

    // Əgər daimi dərs varsa, onu göstər
    if (daimiLessons.length > 0) {
      return renderSingleLesson(daimiLessons[0], false);
    }

    // Əgər həm üst həm də alt həftə dərsi varsa, split göstər
    if (upperWeekLessons.length > 0 && lowerWeekLessons.length > 0) {
      return (
        <div className="h-full flex flex-col gap-1">
          <div className="flex-1">
            {renderSingleLesson(upperWeekLessons[0], true)}
          </div>
          <div className="flex-1">
            {renderSingleLesson(lowerWeekLessons[0], true)}
          </div>
        </div>
      );
    }

    // Əgər yalnız üst həftə dərsi varsa
    if (upperWeekLessons.length > 0) {
      return (
        <div className="h-full flex flex-col gap-1">
          <div className="flex-1">
            {renderSingleLesson(upperWeekLessons[0], true)}
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-100 rounded border text-gray-400 text-xs">
            alt: boş
          </div>
        </div>
      );
    }

    // Əgər yalnız alt həftə dərsi varsa
    if (lowerWeekLessons.length > 0) {
      return (
        <div className="h-full flex flex-col gap-1">
          <div className="flex-1 flex items-center justify-center bg-gray-100 rounded border text-gray-400 text-xs">
            üst: boş
          </div>
          <div className="flex-1">
            {renderSingleLesson(lowerWeekLessons[0], true)}
          </div>
        </div>
      );
    }

    return <span className="text-gray-400 text-sm">-</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader size={50} color="#3b82f6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="text-center text-gray-500 py-8">
        Müəllim cədvəli tapılmadı
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4">
      {/* Başlıq */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpenText className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Müəllim Cədvəli
          </h1>
        </div>
        <div className="text-lg text-gray-700">
          {teacherData.teacher_name} {teacherData.teacher_surname}
        </div>
        <div className="text-sm text-gray-500">
          Kod: {teacherData.teacher_code}
        </div>
      </div>

      {/* Cədvəl */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Saat
                </th>
                {dayNames.map((day, index) => (
                  <th key={index} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((timeSlot, hourIndex) => (
                <tr key={hourIndex} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                    {timeSlot}
                  </td>
                  {dayNames.map((_, dayIndex) => {
                    const dayId = dayIndex + 1;
                    const hourId = hourIndex + 1;
                    
                    const day = teacherData.days?.find(d => d.day_id === dayId);
                    const hour = day?.hours?.find(h => h.hour_id === hourId);
                    const lessons = hour?.lessons || [];

                    return (
                      <td key={dayIndex} className="px-3 py-4 text-sm text-gray-900 h-28 align-top">
                        {renderLesson(lessons)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedule;