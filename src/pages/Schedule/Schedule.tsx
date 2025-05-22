import React, { useEffect, useState } from 'react';
import { get, getProfile } from '../../api/service';
import ClipLoader from 'react-spinners/ClipLoader';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../hooks/usePermissions';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
 

interface Lesson {
  schedule_id: number;
  day_name: string;
  hour_name: string;
  discipline_name: string;
  user_name: string;
  corp_name: string;
  lesson_type_name: string;
  room_name: string;
  year: string;
  semester_num: string;
  week_type_name: string | null;
  group_name: string;
  confirm_status: number;
}

interface Faculty {
  faculty_name: string;
  faculty_id: number;
  lessons: { [key: string]: Lesson[] };
}

interface Day {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  status: number;
}

interface Hour {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  status: number;
}

const Schedule: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [hours, setHours] = useState<Hour[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userData, setUserData] = useState<string | null>(null);
  const navigate = useNavigate();

  const hasAddPermission = usePermissions('add_schedule');
  const hasEditPermission = usePermissions('edit_schedule');
  const hasDeletePermission = usePermissions('delete_schedule');
  const hasViewPermission = usePermissions('view_schedule');

  useEffect(() => {
    fetchProfile();
    fetchSchedules();
    fetchDays();
    fetchHours();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setUserData(response.data.userData);
      setUserName(response.data.userData.name);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await get('/api/schedules');
      setFaculties(response.data.faculties || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDays = async () => {
    try {
      const response = await get('/api/days');
      const sortedDays = response.data.sort((a: Day, b: Day) => {
        return parseInt(a.name) - parseInt(b.name);
      });
      setDays(sortedDays);
    } catch (error) {
      console.error('Error fetching days:', error);
    }
  };

  const fetchHours = async () => {
    try {
      const response = await get('/api/hours');
      setHours(response.data);
    } catch (error) {
      console.error('Error fetching hours:', error);
    }
  };

  const getDayName = (dayNumber: string) => {
    const dayNames = {
      '1': 'Bazar ertəsi',
      '2': 'Çərşənbə axşamı',
      '3': 'Çərşənbə',
      '4': 'Cümə axşamı',
      '5': 'Cümə',
    };
    return dayNames[dayNumber] || dayNumber;
  };
  

  



  const renderScheduleTable = (
    shiftHours: Hour[],
    lessons: { [key: string]: Lesson[] },
  ) => {
    if (Object.keys(lessons).length === 0) {
      return null;
    }

  };

  const filterLessonsByShift = (lessons: { [key: string]: Lesson[] }, shiftHours: string[]) => {
    const filteredLessons: { [key: string]: Lesson[] } = {};
    Object.keys(lessons).forEach((groupId) => {
      const groupLessons = lessons[groupId].filter((lesson) =>
        shiftHours.includes(lesson.hour_name),
      );
      if (groupLessons.length > 0) {
        filteredLessons[groupId] = groupLessons;
      }
    });
    return filteredLessons;
  };

  return (
    <div className="">
            <Breadcrumb pageName="Dərs Cədvəli" />

      <div className="flex w-full justify-between items-center  mb-6">
        {hasAddPermission && (
          <button
            onClick={() => navigate('/schedule/add')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4"
          >
            Dərs Əlavə Et
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <ClipLoader size={50} color={'#123abc'} loading={loading} />
        </div>
      ) : (
        faculties
          .filter((faculty) => Object.keys(faculty.lessons).length > 0)
          .map((faculty) => (
            <div key={faculty.faculty_id}>
              <h3 className="text-xl mt-10 font-bold">{faculty.faculty_name}</h3>
              {renderScheduleTable(
                hours.filter((hour) =>
                  ['09:00-10:20', '10:30-11:50', '12:00-13:20'].includes(
                    hour.name,
                  ),
                ),
                filterLessonsByShift(faculty.lessons, ['09:00-10:20', '10:30-11:50', '12:00-13:20']),
              )}
              {renderScheduleTable(
                hours.filter((hour) =>
                  ['13:35-14:55', '15:05-16:25', '16:35-17:55'].includes(
                    hour.name,
                  ),
                ),
                filterLessonsByShift(faculty.lessons, ['13:35-14:55', '15:05-16:25', '16:35-17:55']),
              )}
              {renderScheduleTable(
                hours.filter((hour) =>
                  ['18:30-19:50', '20:00-21:20'].includes(hour.name),
                ),
                filterLessonsByShift(faculty.lessons, ['18:30-19:50', '20:00-21:20']),
              )}
            </div>
          ))
      )}
    </div>
  );
};

export default Schedule;