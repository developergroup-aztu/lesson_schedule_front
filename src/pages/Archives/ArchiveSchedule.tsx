import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { PiArrowLeft, PiStudent } from 'react-icons/pi';
import { get, postFile } from '../../api/service';
import { Hour, Lesson as LessonType, ScheduleData } from '../../types';
import TableHeader from '../../components/ScheduleTable/TableHeader';
import ScheduleCell from '../../components/ScheduleTable/ScheduleCell';
import { Calendar, BookOpen, Users, Printer, Menu, Maximize2, Minimize2 } from 'lucide-react';
import useSweetAlert from '../../hooks/useSweetAlert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const formatSemesterName = (code: string): string => {
  if (!code || code.length < 5) return code;
  const year = code.slice(0, 4);
  const seasonCode = code.slice(4);

  let season = '';
  switch (seasonCode) {
    case '1':
      season = 'Yaz semestri';
      break;
    case '2':
      season = 'Payız semestri';
      break;
    case '5':
      season = 'Yay semestri';
      break;
    default:
      return code;
  }

  return `${year} ${season}`;
};

interface ArchiveLesson {
  schedule_group_id: number;
  schedule_id: number;
  lesson_id: number;
  lesson_name: string;
  lesson_type_id: number;
  lesson_type_name: string;
  teacher_code: string;
  teacher_name: string;
  teacher_surname: string;
  room_id: number | null;
  room_name: string | null;
  corp_id: number | null;
  week_type_id: number;
  week_type_name: string;
  lock_id: number;
  parent_group: number | null;
  merge_id: number | null;
}

interface HourSlot {
  hour_id: number;
  hour_name: string;
  lessons: ArchiveLesson[];
}

interface DaySchedule {
  hours: HourSlot[];
}

interface GroupSchedule {
  group_id: number;
  group_name: string;
  days: Record<string, DaySchedule>;
}

interface ArchiveScheduleResponse {
  faculty_id: string;
  faculty_name: string;
  semester_id: string;
  semester_name: string;
  groups: GroupSchedule[];
  room_message?: string | null;
}

// Transform archive lesson to standard Lesson format
const transformArchiveLesson = (archiveLesson: ArchiveLesson): LessonType => {
  return {
    schedule_id: archiveLesson.schedule_id,
    schedule_group_id: archiveLesson.schedule_group_id,
    subject_id: archiveLesson.lesson_id,
    subject_name: archiveLesson.lesson_name,
    lesson_type_id: archiveLesson.lesson_type_id,
    lesson_type_name: archiveLesson.lesson_type_name,
    week_type_id: archiveLesson.week_type_id,
    week_type_name: archiveLesson.week_type_name,
    teacher: {
      code: archiveLesson.teacher_code || '',
      name: archiveLesson.teacher_name || '',
      surname: archiveLesson.teacher_surname || '',
    },
    room: {
      room_id: archiveLesson.room_id || 0,
      room_name: archiveLesson.room_name || '',
      corp_name: archiveLesson.corp_id?.toString() || '',
    },
    teacher_name: archiveLesson.teacher_name,
    teacher_surname: archiveLesson.teacher_surname,
    corp_id: archiveLesson.corp_id,
    room_name: archiveLesson.room_name,
    lock_id: archiveLesson.lock_id,
    parent_group: archiveLesson.parent_group,
    lesson_name: archiveLesson.lesson_name,
    confirm_status: 1,
    blocked: archiveLesson.lock_id === 1,
  } as LessonType;
};

// Transform archive data to ScheduleData format
const transformArchiveData = (
  archiveData: ArchiveScheduleResponse,
  hours: Hour[]
): ScheduleData => {
  const transformedGroups = archiveData.groups.map((group) => {
    const days: Record<number, { day_id: number; hours: { hour_id: number; lessons: LessonType[] }[] }> = {};
    
    Object.keys(group.days).forEach((dayKey) => {
      const dayId = Number(dayKey);
      const daySchedule = group.days[dayKey];
      
      const transformedHours = daySchedule.hours.map((hourSlot) => ({
        hour_id: hourSlot.hour_id,
        lessons: hourSlot.lessons.map(transformArchiveLesson),
      }));
      
      days[dayId] = {
        day_id: dayId,
        hours: transformedHours,
      };
    });
    
    return {
      group_id: group.group_id,
      group_name: group.group_name,
      days: days as any,
    };
  });
  
  return {
    faculty: {
      faculty_id: Number(archiveData.faculty_id),
      faculty_name: archiveData.faculty_name,
      groups: transformedGroups,
    },
    hours: hours,
    lesson_types: [],
    week_types: [],
    subjects: [],
    rooms: [],
  };
};

const ArchiveSchedule: React.FC = () => {
  const { semesterId, facultyId } = useParams<{ semesterId: string; facultyId: string }>();
  const navigate = useNavigate();
  const { successAlert, errorAlert } = useSweetAlert();

  const [archiveData, setArchiveData] = useState<ArchiveScheduleResponse | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [hours, setHours] = useState<Hour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tableMaximized, setTableMaximized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      if (!semesterId || !facultyId) {
        setError('Semestr və ya fakültə ID-si tapılmadı.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [scheduleRes, hoursRes] = await Promise.all([
          get(`/api/semesters/${semesterId}/faculties/${facultyId}`),
          get('/api/hours'),
        ]);

        if (!isMounted) return;
        
        const fetchedHours = Array.isArray(hoursRes.data) ? hoursRes.data : [];
        setArchiveData(scheduleRes.data);
        setHours(fetchedHours);
        
        // Transform archive data to ScheduleData format
        const transformed = transformArchiveData(scheduleRes.data, fetchedHours);
        setScheduleData(transformed);
      } catch (err: any) {
        if (!isMounted) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Arxiv cədvəli yüklənmədi. Zəhmət olmasa yenidən cəhd edin.';
        setError(msg);
        setArchiveData(null);
        setScheduleData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [semesterId, facultyId]);

  // Find lessons helper for transformed data
  const findLessons = useCallback((groupId: number, dayId: number, hourId: number): LessonType[] => {
    if (!scheduleData) return [];
    const group = scheduleData.faculty.groups.find((g) => g.group_id === groupId);
    if (!group) return [];
    const day = group.days[dayId];
    if (!day) return [];
    const hour = day.hours.find((h) => h.hour_id === hourId);
    return hour?.lessons || [];
  }, [scheduleData]);

  // View-only handlers (no-op functions)
  const handleAddLesson = () => {
    // No-op for archive view
  };

  const handleOpenContextMenu = () => {
    // No-op for archive view
  };

  const handleEditLesson = () => {
    // No-op for archive view
  };

  // Toggle table fullscreen
  const handleToggleMaximize = () => {
    setTableMaximized((prev) => !prev);
  };

  // Calculate statistics
  const totalLessons = scheduleData
    ? scheduleData.faculty.groups.reduce((total, group) => {
        return (
          total +
          Object.values(group.days).reduce((dayTotal, day) => {
            return (
              dayTotal +
              day.hours.reduce((hourTotal, hour) => {
                return hourTotal + (hour.lessons?.length || 0);
              }, 0)
            );
          }, 0)
        );
      }, 0)
    : 0;

  const activeGroups = scheduleData ? scheduleData.faculty.groups.length : 0;

  // PDF download handler
  const handleDownloadPdf = async () => {
    if (!facultyId || !archiveData?.semester_id) {
      errorAlert('Xəta!', 'Fakültə və ya semestr məlumatı tapılmadı.');
      return;
    }

    setIsDownloading(true);

    try {
      const response = await postFile(`/api/schedule/faculty/${facultyId}/print`, {
        semester_id: archiveData.semester_id,
      });

      if (!response.data || (response.data instanceof Blob && response.data.size === 0)) {
        errorAlert('Xəta!', 'PDF boş və ya səhvdir.');
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank'); // Yeni tab-da açır

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);

      successAlert('Uğurlu!', 'PDF faylı yeni tab-da açıldı!');
    } catch (err: any) {
      console.error('Download error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Bilinməyən xəta';
      errorAlert('Xəta!', `PDF endirilməsində xəta: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
      setIsMenuOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <ClipLoader size={40} color="#3949AB" />
          <p className="text-gray-600 font-medium">Arxiv cədvəli yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error || !archiveData || !scheduleData) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-6 py-4 text-center max-w-lg">
          <p className="font-semibold mb-1">Xəta</p>
          <p className="text-sm">{error || 'Məlumat tapılmadı.'}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100"
        >
          <PiArrowLeft className="w-4 h-4" />
          Geri qayıt
        </button>
      </div>
    );
  }

  const groups = scheduleData.faculty.groups;
  const formattedSemesterName = formatSemesterName(archiveData.semester_name);

  return (
    <>
    <Breadcrumb pageName={archiveData.faculty_name} />
    <div className={`min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden ${tableMaximized ? 'fixed inset-0 overflow-hidden z-[9999]' : ''}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-40">
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-200 rounded-full animate-ping" />
          <div className="absolute top-40 right-32 w-1 h-1 bg-purple-200 rounded-full animate-pulse" />
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-teal-200 rounded-full animate-bounce" />
          <div
            className="absolute top-1/3 right-1/4 w-1 h-1 bg-amber-200 rounded-full animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>
      </div>

      <div className="">
        <div className="bg-gradient-to-r from-blue-100/90 via-indigo-100/90 to-purple-100/90 backdrop-blur-md border-b border-blue-200/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-indigo-200/20" />
          
          {/* Header */}
          <header className="relative z-20 pb-4 px-8 pt-6">
            <div className="flex items-center justify-between">
              <h1 className="md:text-xl text-md font-extrabold text-indigo-800 tracking-tight">
                {archiveData.faculty_name} Fakültəsi Arxiv Cədvəli
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="hidden sm:flex items-center gap-2 px-2 h-10 text-sm text-nowrap rounded-lg bg-white/40 border border-indigo-200 text-indigo-800 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-5 h-5" />
                  {isDownloading ? 'Yüklənir...' : 'PDF Yüklə'}
                </button>
                <button
                  className="sm:hidden flex items-center justify-center p-3 rounded-xl bg-white/40 border border-indigo-200 text-blue-800 backdrop-blur-sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
              <div className="absolute right-8 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-indigo-200 sm:hidden z-30">
                <div className="flex flex-col p-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-4 h-4" />
                    {isDownloading ? 'Yüklənir...' : 'PDF Yüklə'}
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Statistics Cards */}
          <div className="relative px-4 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-8 w-full">
                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm rounded-lg px-4 py-3 sm:px-6 sm:py-3 border border-white/60 shadow-md w-full sm:w-auto">
                  <div className="p-2 bg-blue-400 rounded-lg ">
                    <Calendar className="w-5 h-5 text-blue-800" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">
                      Dərs Cədvəli
                    </p>
                    <p className="text-slate-800 text-lg font-bold">
                      {formattedSemesterName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md rounded-lg px-4 py-3 sm:px-6 sm:py-3 border border-white/60 shadow-md w-full sm:w-auto">
                  <div className="p-2 bg-teal-400 rounded-lg shadow-md">
                    <Users className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">
                      Aktiv Qrup
                    </p>
                    <p className="text-slate-800 text-lg font-bold">
                      {activeGroups}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md rounded-lg px-4 py-3 sm:px-6 sm:py-3 border border-white/60 shadow-md w-full sm:w-auto">
                  <div className="p-2 bg-orange-400 rounded-lg">
                    <BookOpen className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">
                      Toplam Dərs
                    </p>
                    <p className="text-slate-800 text-lg font-bold">
                      {totalLessons}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative">
        {archiveData.room_message && (
          <div className="px-4 sm:px-8 pt-6">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">
              <PiStudent className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-semibold">Otaq bildirimi</p>
                <p className="text-sm">{archiveData.room_message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="schedule-print-area   pt-6">
          <div
            className={`flex justify-end items-center mb-4 pr-4 ${
              tableMaximized ? 'absolute top-1 right-1 z-50' : 'relative'
            }`}
          >
            {/* <button
              onClick={handleToggleMaximize}
              className="flex items-center text-sm gap-2 p-2 rounded-lg text-slate-500 border bg-[#ffffffd8] hover:bg-slate-100 transition-colors duration-200"
            >
              {tableMaximized ? (
                <>
                  <Minimize2 size={16} />
                </>
              ) : (
                <>
                  <Maximize2 size={16} />
                  <span>Tam ekran</span>
                </>
              )}
            </button> */}
          </div>

          <div
            className={`bg-white/80 backdrop-blur-sm  border border-slate-200 shadow-sm overflow-auto relative ${
              tableMaximized ? 'h-[98vh]' : 'max-h-[75vh]'
            }`}
          >
            <table className="w-full border-collapse min-w-[900px]">
              <TableHeader hours={hours} />
              <tbody className="divide-y divide-slate-200/50">
                {groups.map((group) => (
                  <tr key={group.group_id} className="bg-white hover:bg-slate-50 transition">
                    <td className="group-name sticky left-0 z-1 bg-gradient-to-r from-slate-50/95 to-white/95 backdrop-blur-sm border-r border-slate-200/60 p-4 min-w-[150px]">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 shadow-lg" />
                        <span className="font-bold text-slate-700 text-sm tracking-wide whitespace-nowrap">
                          {group.group_name}
                        </span>
                      </div>
                    </td>
                    {Array.from({ length: 5 }).map((_, dayIndex: number) => {
                      const dayId = dayIndex + 1;
                      return hours.map((hour: Hour) => {
                        const hourLessons = findLessons(group.group_id, dayId, hour.id);
                        return (
                          <ScheduleCell
                            key={`${group.group_id}-${dayId}-${hour.id}`}
                            groupId={group.group_id}
                            dayId={dayId}
                            hourId={hour.id}
                            lessons={hourLessons}
                            onAddLesson={handleAddLesson}
                            onOpenContextMenu={handleOpenContextMenu}
                            onEditLesson={handleEditLesson}
                            readOnly={true}
                          />
                        );
                      });
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default ArchiveSchedule;