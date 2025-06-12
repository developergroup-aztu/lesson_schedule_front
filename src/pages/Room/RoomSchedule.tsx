import React, { useEffect, useState } from 'react';
import { get } from '../../api/service';
import { useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { Sun, Moon, Users, MapPin } from 'lucide-react';

const dayNames = ['B.e.', 'Ç.a.', 'Ç.', 'C.a.', 'C.'];

const morningHours = [
  { hour_id: 1, hour_name: '09:00-10:20' },
  { hour_id: 2, hour_name: '10:30-11:50' },
  { hour_id: 3, hour_name: '12:00-13:20' },
];
const afternoonHours = [
  { hour_id: 4, hour_name: '13:35-14:55' },
  { hour_id: 5, hour_name: '15:05-16:25' },
  { hour_id: 6, hour_name: '16:35-17:55' },
];

const RoomSchedule = () => {
  const { id } = useParams();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const res = await get(`/api/rooms/${id}`);
        setRoom(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  if (!room) {
    return <div className="text-center text-red-500 py-10">Otaq tapılmadı</div>;
  }

  // Saatları tap
  const allHours: { hour_id: number; hour_name: string }[] = [];
  for (const day of Object.values(room.days || {})) {
    for (const hour of (day as any).hours) {
      if (!allHours.find((h) => h.hour_id === hour.hour_id)) {
        allHours.push({ hour_id: hour.hour_id, hour_name: hour.hour_name });
      }
    }
  }
  allHours.sort((a, b) => a.hour_id - b.hour_id);

  const renderLessons = (lessons: any[], dayIdx: number, hourId: number) => {
    const daimiLessons = lessons.filter((l: any) => l.week_type_name === 'daimi');
    const upperLessons = lessons.filter((l: any) => l.week_type_name === 'üst həftə');
    const lowerLessons = lessons.filter((l: any) => l.week_type_name === 'alt həftə');

    if (lessons.length === 0) {
      return <span className="text-gray-300 text-xs">-</span>;
    }

    // Əgər daimi dərs varsa, tam xananı tutsun
    if (daimiLessons.length > 0) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center">
          {daimiLessons.map((lesson: any, idx: number) => (
            <div key={'d' + idx} className="w-full h-full flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 text-sm shadow-md hover:shadow-lg transition-all duration-200">
              <div className="font-bold text-gray-800 text-center mb-2 text-base">{lesson.subject_name}</div>
              <div className="text-green-700 font-semibold mb-1">{lesson.lesson_type_name}</div>
              <div className="text-gray-700 font-medium mb-1">{lesson.group_name}</div>
              <div className="text-gray-800 mb-1 text-center">{lesson.teacher_name} {lesson.teacher_surname}</div>
              <div className="text-green-600 text-xs font-medium px-2 py-1 bg-green-100 rounded-full">{lesson.week_type_name}</div>
            </div>
          ))}
        </div>
      );
    }

    // Əgər daimi dərs yoxdursa, üst və alt həftələri göstər
    return (
      <div className="h-full w-full flex flex-col">
        {/* Üst həftə */}
        <div className="flex-1 mb-1">
          {upperLessons.length > 0 ? (
            upperLessons.map((lesson: any, idx: number) => (
              <div key={'u' + idx} className="h-full p-2 rounded-md bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-xs shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="font-semibold text-gray-800 truncate">{lesson.subject_name}</div>
                <div className="text-blue-600 mt-1">{lesson.lesson_type_name}</div>
                <div className="text-gray-600 mt-1">{lesson.group_name}</div>
                <div className="text-gray-700 mt-1 ">{lesson.teacher_name} {lesson.teacher_surname}</div>
                <div className="text-blue-500 mt-1 text-[10px] bg-blue-100 px-1 rounded">{lesson.week_type_name}</div>
              </div>
            ))
          ) : (
            lowerLessons.length > 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs bg-gray-50 border border-gray-200 rounded-md">
                üst: boş
              </div>
            )
          )}
        </div>

        {/* Alt həftə */}
        <div className="flex-1">
          {lowerLessons.length > 0 ? (
            lowerLessons.map((lesson: any, idx: number) => (
              <div key={'l' + idx} className="h-full p-2 rounded-md bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 text-xs shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="font-semibold text-gray-800 truncate">{lesson.subject_name}</div>
                <div className="text-purple-600 mt-1">{lesson.lesson_type_name}</div>
                <div className="text-gray-600 mt-1">{lesson.group_name}</div>
                <div className="text-gray-700 mt-1">{lesson.teacher_name} {lesson.teacher_surname}</div>
                <div className="text-purple-500 mt-1 text-[10px] bg-purple-100 px-1 rounded">{lesson.week_type_name}</div>
              </div>
            ))
          ) : (
            upperLessons.length > 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs bg-gray-50 border border-gray-200 rounded-md">
                alt: boş
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const renderScheduleTable = (hours: any[], title: string, isAfternoon: boolean = false) => (
    <div className="relative mb-12">
      {/* Shift Background Overlay */}
      <div
        className={`absolute inset-0 rounded-3xl ${
          isAfternoon
            ? 'bg-gradient-to-br from-violet-100/40 via-purple-100/30 to-pink-100/40'
            : 'bg-gradient-to-br from-blue-100/40 via-sky-100/30 to-cyan-100/40'
        } -z-10`}
      />

      <div className="relative backdrop-blur-sm bg-white/60 rounded-3xl border border-white/70 shadow-2xl overflow-hidden">
        {/* Modern Glass Header */}
        <div
          className={`relative px-8 py-6 ${
            isAfternoon
              ? 'bg-violet-500'
              : 'bg-[#FCB454]'
          } backdrop-blur-xl`}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isAfternoon ? (
                <Moon className="w-7 h-7 text-white drop-shadow-lg" />
              ) : (
                <Sun className="w-7 h-7 text-white drop-shadow-lg" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  {title}
                </h2>
                <p className="text-white/80 text-sm font-medium">
                  {hours.length} dərs saatı
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
              <MapPin className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">
                {room.corp_id} - {room.room_name}
              </span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className={`py-4 px-6 border-b-2 ${
                  isAfternoon 
                    ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200' 
                    : 'bg-gradient-to-r from-blue-50 to-sky-50 '
                } sticky left-0 z-10 font-bold text-slate-700`}>
                  Otaq
                </th>
                {dayNames.map((day, i) => (
                  <th 
                    key={i} 
                    colSpan={hours.length} 
                    className={`py-4 px-4 border-b-2 ${
                      isAfternoon 
                        ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200' 
                        : 'bg-gradient-to-r from-blue-50 to-sky-50 '
                    } text-center font-bold text-slate-700`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
              <tr>
                <th className={`py-3 px-6 border-b ${
                  isAfternoon 
                    ? 'bg-gradient-to-r from-violet-25 to-purple-25 border-violet-100' 
                    : 'bg-gradient-to-r from-blue-25 to-sky-25 border-blue-100'
                } sticky left-0 z-10`}>
                </th>
                {dayNames.map((_, dayIdx) =>
                  hours.map((hour) => (
                    <th 
                      key={dayIdx + '-' + hour.hour_id} 
                      className={`py-3 px-3 border-b ${
                        isAfternoon 
                          ? 'bg-gradient-to-r from-violet-25 to-purple-25 border-violet-100' 
                          : 'bg-gradient-to-r from-blue-25 to-sky-25 border-blue-100'
                      } text-xs text-center font-semibold text-slate-600`}
                    >
                      {hour.hour_name}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              <tr className={`transition-all duration-300 hover:bg-gradient-to-r ${
                isAfternoon
                  ? 'hover:from-violet-50/50 hover:to-purple-50/50'
                  : 'hover:from-blue-50/50 hover:to-sky-50/50'
              }`}>
                <td className="py-4 px-6 border-b font-bold bg-gradient-to-r from-slate-50/95 to-white/95 backdrop-blur-sm sticky left-0 z-10 border-r border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isAfternoon
                          ? 'bg-gradient-to-r from-violet-200 to-purple-200'
                          : 'bg-[#ffdcae]'
                      } shadow-lg`}
                    />
                    <span className="text-slate-700 font-bold">
                      {room.room_name}
                    </span>
                  </div>
                </td>
                {dayNames.map((_, dayIdx) =>
                  hours.map((hour) => {
                    const day = room.days?.[dayIdx + 1];
                    const hourObj = day?.hours?.find((h: any) => h.hour_id === hour.hour_id);
                    const lessons = hourObj?.lessons || [];
                    
                    return (
                      <td key={dayIdx + '-' + hour.hour_id} className="border border-slate-200/50 p-2 min-w-[160px] h-[140px] align-top bg-white/30 backdrop-blur-sm">
                        {renderLessons(lessons, dayIdx, hour.hour_id)}
                      </td>
                    );
                  })
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-200/10 to-emerald-200/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-slate-800">Otaq:</span> 
            <span className="text-blue-600">{room.corp_id} - {room.room_name}</span>
          </h1>
        </div>
        
        {/* Morning Shift */}
        {renderScheduleTable(morningHours, "Səhər Növbəsi", false)}
        
        {/* Afternoon Shift */}
        {renderScheduleTable(afternoonHours, "Günorta Növbəsi", true)}
      </div>
    </div>
  );
};

export default RoomSchedule;