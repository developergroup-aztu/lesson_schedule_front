import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { ScheduleData, ScheduleContextType, Lesson } from '../types';
import { useAuth } from './AuthContext';
import { get, post, del } from '../api/service'; // del əlavə olundu
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const params = useParams();
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);

  // Schedules-i endpointdən al (refresh üçün ayrıca funksiya)
  const fetchSchedule = useCallback(async () => {
    let facultyId: number | undefined;

    if (
      (user?.roles.includes("admin") || user?.roles.includes("SuperAdmin"))
    ){
      facultyId = params.id
    }
    else{
      facultyId = user?.faculty_id;
    }

    if (!facultyId) return;
    setLoading(true);
    try {
      const response = await get(`/api/schedules/${facultyId}`);
      setScheduleData(response.data);
    } catch (error) {
      setScheduleData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.faculty_id, user?.role, params.facultyId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  if (loading || !scheduleData) {
    return <div>Yüklənir...</div>;
  }

  const addLesson = (groupId: number, dayId: number, hourId: number, lesson: Lesson) => {
    setScheduleData(prevData => {
      if (!prevData) return prevData;
      const newData = { ...prevData };
      const groupIndex = newData.groups.findIndex(g => g.group_id === groupId);
      if (groupIndex === -1) return prevData;
      const group = newData.groups[groupIndex];
      if (!group.days[dayId]) {
        group.days[dayId] = { hours: [] };
      }
      const day = group.days[dayId];
      const hourIndex = day.hours.findIndex(h => h.hour_id === hourId);
      if (hourIndex === -1) {
        day.hours.push({
          hour_id: hourId,
          hour_name: '',
          lessons: [lesson],
        });
      } else {
        day.hours[hourIndex].lessons.push(lesson);
      }
      return newData;
    });
  };

  const editLesson = (
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number,
    updatedLesson: Lesson
  ) => {
    setScheduleData(prevData => {
      if (!prevData) return prevData;
      const newData = { ...prevData };
      const groupIndex = newData.groups.findIndex(g => g.group_id === groupId);
      if (groupIndex === -1) return prevData;
      const group = newData.groups[groupIndex];
      if (!group.days[dayId]) return prevData;
      const day = group.days[dayId];
      const hourIndex = day.hours.findIndex(h => h.hour_id === hourId);
      if (hourIndex === -1) return prevData;
      const hour = day.hours[hourIndex];
      if (lessonIndex < 0 || lessonIndex >= hour.lessons.length) return prevData;
      hour.lessons[lessonIndex] = updatedLesson;
      return newData;
    });
  };

  // Yeni: Dərsi backend-dən sil
const deleteLesson = async (
  groupId: number,
  dayId: number,
  hourId: number,
  lessonIndex: number
) => {
  let schedule_group_id: number | undefined;
  let deleted = false;
  setScheduleData(prevData => {
    if (!prevData) return prevData;
    const newData = { ...prevData };
    const groupIndex = newData.groups.findIndex(g => g.group_id === groupId);
    if (groupIndex === -1) return prevData;
    const group = newData.groups[groupIndex];
    if (!group.days[dayId]) return prevData;
    const day = group.days[dayId];
    const hourIndex = day.hours.findIndex(h => h.hour_id === hourId);
    if (hourIndex === -1) return prevData;
    const hour = day.hours[hourIndex];
    if (lessonIndex < 0 || lessonIndex >= hour.lessons.length) return prevData;
    // schedule_group_id-ni tap
    schedule_group_id = hour.lessons[lessonIndex]?.schedule_group_id;
    hour.lessons.splice(lessonIndex, 1);
    if (hour.lessons.length === 0) {
      day.hours.splice(hourIndex, 1);
      if (day.hours.length === 0) {
        delete group.days[dayId];
      }
    }
    deleted = true;
    return newData;
  });
  // Backend silmə çağırışı və SweetAlert
  if (schedule_group_id && deleted) {
    try {
      const res = await del(`/api/schedules/${schedule_group_id}`);
      if (res?.message || res?.data?.message) {
        Swal.fire({
          icon: 'success',
          title: 'Uğurlu',
          text: res.message || res.data.message,
          confirmButtonColor: '#2563eb',
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Xəta',
        text: error?.response?.data?.message || 'Silinmə zamanı xəta baş verdi.',
        confirmButtonColor: '#2563eb',
      });
      fetchSchedule();
    }
  }
};
  const toggleBlockStatus = async (
    schedule_id: number,
    schedule_group_id: number,
    lock_id: 0 | 1
  ) => {
    try {
      await post('/api/schedules/lock', {
        schedule_id,
        schedule_group_id,
        lock_id,
      });

      setScheduleData(prevData => {
        if (!prevData) return prevData;
        const newData = { ...prevData };
        for (const group of newData.groups) {
          for (const dayKey in group.days) {
            const day = group.days[dayKey];
            for (const hour of day.hours) {
              for (const lesson of hour.lessons) {
                if (
                  lesson.schedule_id === schedule_id &&
                  lesson.schedule_group_id === schedule_group_id
                ) {
                  lesson.lock_id = lock_id;
                }
              }
            }
          }
        }
        return newData;
      });
    } catch (error) {
      console.error('Kilitləmə xətası:', error);
    }
  };

  const value: ScheduleContextType = {
    scheduleData,
    setScheduleData,
    addLesson,
    editLesson,
    deleteLesson,
    toggleBlockStatus,
    refreshSchedule: fetchSchedule,
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};