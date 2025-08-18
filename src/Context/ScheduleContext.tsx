import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { ScheduleData, ScheduleContextType, Lesson } from '../types';
import { useAuth } from './AuthContext';
import { get, post, del } from '../api/service'; 
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';

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
  const [hasError, setHasError] = useState(false);
  const alertShownRef = useRef(false); // Alert göstərilməsini kontrol etmək üçün

  const fetchSchedule = useCallback(async () => {
    let facultyId: number | undefined;

    if (
      user?.roles?.includes("admin") || user?.roles?.includes("SuperAdmin")
    ){
      facultyId = params.id ? Number(params.id) : undefined;
    }
    else if ((user as any)?.faculty_id) {
      facultyId = Number((user as any).faculty_id);
    }

    if (!facultyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasError(false);
    
    try {
      const response = await get(`/api/faculties/${facultyId}`);
      
      // Məlumatı set et
      if (response?.data) {
        setScheduleData({
          ...response.data,
          groups: response.data.groups ?? [],
        });
        
        // Room message varsa warning göstər (yalnız bir dəfə)
        if (response.data.room_message && !alertShownRef.current) {
          Swal.fire({
            icon: 'warning',
            title: 'Diqqət',
            text: response.data.room_message,
            confirmButtonColor: '#2563eb',
            timer: 4000,
            timerProgressBar: true
          });
          alertShownRef.current = true;
        }
      }
    } catch (error: any) {
      console.error('Cədvəl yükləmə xətası:', error);
      setHasError(true);
      setScheduleData(null);
      
      // Server error alert göstər
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Cədvəl yükləmə zamanı server xətası baş verdi';
      
      Swal.fire({
        icon: 'error',
        title: 'Server Xətası',
        text: errorMessage,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Yenidən cəhd et',
      }).then((result) => {
        if (result.isConfirmed) {
          // Yenidən cəhd et
          fetchSchedule();
        }
      });
    } finally {
      setLoading(false);
    }
  }, [user, params.id]);

  useEffect(() => {
    // Alert ref-i reset et hər yeni fetch-dən əvvəl
    alertShownRef.current = false;
    fetchSchedule();
  }, [fetchSchedule]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader size={40} color="#3949AB" />
          <span className="text-gray-600 font-medium">Cədvəl yüklənir...</span>
        </div>
      </div>
    );
  }

  // Error state - məlumat xarakterli göstəriş
  if (hasError || !scheduleData) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800">
            Cədvəl məlumatları tapılmadı
          </h3>
          <p className="text-gray-600">
            Fakultə məlumatları əlçatan deyil və ya server xətası baş verdi. 
            Zəhmət olmasa bir qədər sonra yenidən cəhd edin.
          </p>
          <button
            onClick={fetchSchedule}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yenidən yüklə
          </button>
        </div>
      </div>
    );
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
        fetchSchedule(); // Xəta olduqda yenidən yüklə
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
      Swal.fire({
        icon: 'error',
        title: 'Xəta',
        text: 'Kilitləmə əməliyyatı zamanı xəta baş verdi',
        confirmButtonColor: '#2563eb',
      });
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