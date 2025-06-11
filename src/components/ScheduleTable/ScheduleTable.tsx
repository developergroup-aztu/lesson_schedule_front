import React, { useEffect, useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import TableHeader from './TableHeader';
import ScheduleCell from './ScheduleCell';
import ContextMenu from '../ContextMenu';
import { get } from '../../api/service';
import { Clock, Users, Sun, Moon } from 'lucide-react';

interface Hour {
  id: number;
  time: string;
}

const ScheduleTable: React.FC = ({ onAddLesson, onEditLesson }) => {
  const { scheduleData } = useSchedule();
  const groups = scheduleData.groups;

  const [hours, setHours] = useState<Hour[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    groupId: number | null;
    dayId: number | null;
    hourId: number | null;
    lessonIndex: number | null;
    weekTypeId: number | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    groupId: null,
    dayId: null,
    hourId: null,
    lessonIndex: null,
    weekTypeId: null,
  });

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const response = await get('/api/hours');
        setHours(response.data || []);
      } catch {
        setHours([]);
      }
    };
    fetchHours();
  }, []);

  const morningHours = hours.slice(0, 3);
  const afternoonHours = hours.slice(3, 6);

  const findLessons = (groupId: number, dayId: number, hourId: number) => {
    const group = groups.find((g) => g.group_id === groupId);
    if (!group) return undefined;

    const day = group.days[dayId];
    if (!day) return undefined;

    const hour = day.hours.find((h) => h.hour_id === hourId);
    return hour?.lessons;
  };

  const handleOpenContextMenu = (
    e: React.MouseEvent,
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number,
    weekTypeId: number,
  ) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      groupId,
      dayId,
      hourId,
      lessonIndex,
      weekTypeId,
    });
  };

// ...existing code...

const renderShift = (shiftHours: Hour[], isAfternoon: boolean = false) => (
  <div className="relative">
    {/* Shift Background Overlay */}
    <div
      className={`absolute inset-0 rounded-3xl ${
        isAfternoon
          ? 'bg-gradient-to-br from-violet-100/40 via-purple-100/30 to-pink-100/40'
          : 'bg-gradient-to-br from-amber-100/40 via-orange-100/30 to-yellow-100/40'
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
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                {isAfternoon ? 'Günorta Növbəsi' : 'Səhər Növbəsi'}
              </h3>
              <p className="text-white/80 text-sm font-medium">
                {shiftHours.length} dərs saatı
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">
              {groups.length} qrup
            </span>
          </div>
        </div>
      </div>
      
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <TableHeader hours={shiftHours} />
          <tbody className="divide-y divide-slate-200/50">
            {groups
              .filter((group) => {
                // Qrupun bu növbədə ən azı bir dərsi varsa göstər
                for (let dayId = 1; dayId <= 5; dayId++) {
                  const day = group.days[dayId];
                  if (!day) continue;
                  for (const hour of shiftHours) {
                    const hourObj = day.hours.find((h) => h.hour_id === hour.id);
                    if (hourObj && hourObj.lessons && hourObj.lessons.length > 0) {
                      return true;
                    }
                  }
                }
                return false;
              })
              .map((group, groupIndex) => (
                <tr
                  key={group.group_id}
                  className={`transition-all duration-300 hover:bg-gradient-to-r ${
                    isAfternoon
                      ? 'hover:from-violet-50/50 hover:to-purple-50/50'
                      : 'hover:from-amber-50/50 hover:to-orange-50/50'
                  } group`}
                >
                  {/* Group Name Cell */}
                  <td className="sticky left-0 z-1 bg-gradient-to-r from-slate-50/95 to-white/95 backdrop-blur-sm border-r border-slate-200/60 p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isAfternoon
                            ? 'bg-gradient-to-r from-violet-200 to-purple-200'
                            : 'bg-gradient-to-r from-amber-200 to-orange-200'
                        } shadow-lg`}
                      />
                      <span className="font-bold text-slate-700 text-sm tracking-wide">
                        {group.group_name}
                      </span>
                    </div>
                  </td>

                  {/* Schedule Cells */}
                  {Array.from({ length: 5 }).map((_, dayIndex) => {
                    const dayId = dayIndex + 1;
                    return shiftHours.map((hour) => {
                      const hourLessons = findLessons(
                        group.group_id,
                        dayId,
                        hour.id,
                      );
                      return (
                        <ScheduleCell
                          key={`${group.group_id}-${dayId}-${hour.id}`}
                          groupId={group.group_id}
                          dayId={dayId}
                          hourId={hour.id}
                          lessons={hourLessons}
                          onAddLesson={onAddLesson}
                          onOpenContextMenu={handleOpenContextMenu}
                          onEditLesson={onEditLesson}
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
  </div>
);

// ...existing code...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />{' '}
        {/* Softened */}
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />{' '}
        {/* Softened */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-200/10 to-emerald-200/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />{' '}
        {/* Softened */}
      </div>

      <div className="relative pt-4 space-y-12">
        {/* Context Menu */}
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={() => setContextMenu((c) => ({ ...c, isOpen: false }))}
          groupId={contextMenu.groupId}
          dayId={contextMenu.dayId}
          hourId={contextMenu.hourId}
          lessonIndex={contextMenu.lessonIndex}
          weekTypeId={contextMenu.weekTypeId}
          onEdit={() => {
            /* Modal açmaq və ya başqa əməliyyat */
          }}
        />

        {/* Morning Shift */}
        {renderShift(morningHours, false)}

        {/* Afternoon Shift */}
        {renderShift(afternoonHours, true)}
      </div>

      {/* Floating Stats Panel */}
      <div className="fixed bottom-8 right-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-2xl p-6 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Toplam Saat</p>
              <p className="text-lg font-bold text-slate-700">{hours.length}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Aktiv Qrup</p>
              <p className="text-lg font-bold text-slate-700">
                {groups.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable;
