// src/components/ScheduleTable/ScheduleTable.tsx
import React, { useEffect, useState, forwardRef, useCallback } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import TableHeader from './TableHeader';
import ScheduleCell from './ScheduleCell';
import ContextMenu from '../ContextMenu';
import { get } from '../../api/service';
import { Clock, Users, Sun, Moon, X, Maximize2, Minimize2, ChevronDown, ChevronRight } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import type { Hour as HourType } from '../../types';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

// Key for localStorage
const LOCAL_STORAGE_STATS_KEY = 'scheduleStatsPanelVisible';

// Use forwardRef to allow ScheduleTable to receive a ref
const ScheduleTable = forwardRef<HTMLDivElement, {
  onAddLesson: (...args: any[]) => void;
  onEditLesson: (...args: any[]) => void;
  onOpenContextMenu: (...args: any[]) => void;
}>((
  { onAddLesson, onEditLesson, onOpenContextMenu },
  ref
) => {
  const { scheduleData } = useSchedule();
  const { user } = useAuth();
  const params = useParams();
  const groups: any[] = (scheduleData as any).groups || [];
  // Faculty ID: from URL, then user, then scheduleData
  const facultyId = params.id || (user as any)?.faculty_id || (scheduleData as any)?.faculty?.faculty_id;

  // State for PDF download loading
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // PDF download handler (now using axios)
  const handleDownloadPdf = async () => {
    if (!facultyId) {
      alert('Fakültə ID tapılmadı!');
      return;
    }
    setDownloadingPdf(true);
    try {
      // Use axios instance (get) for the request
      const response = await get(`/public/api/schedule/faculty/${facultyId}/print`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const filename = `schedule-faculty-${facultyId}.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('PDF yüklənərkən xəta baş verdi!');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const [hours, setHours] = useState<HourType[]>([]);
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

  // State for the visibility of the stats panel
  const [showStatsPanel, setShowStatsPanel] = useState<boolean>(() => {
    try {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_STATS_KEY);
      return storedValue ? JSON.parse(storedValue) : true;
    } catch (e) {
      console.error("Failed to parse localStorage item", e);
      return true;
    }
  });

  // NEW: State for open/close of shifts
  const [morningOpen, setMorningOpen] = useState(true);
  const [afternoonOpen, setAfternoonOpen] = useState(true);
  // NEW: State for maximize per shift
  const [morningMaximized, setMorningMaximized] = useState(false);
  const [afternoonMaximized, setAfternoonMaximized] = useState(false);

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

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(showStatsPanel));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [showStatsPanel]);

  const morningHours = hours.slice(0, 3);
  const afternoonHours = hours.slice(3, 6);

  const findLessons = useCallback((groupId: number, dayId: number, hourId: number) => {
    const group = groups.find((g: any) => g.group_id === groupId);
    if (!group) return undefined;

    const day = group.days[dayId];
    if (!day) return undefined;

    const hour = day.hours.find((h: any) => h.hour_id === hourId);
    return hour?.lessons;
  }, [groups]);

  const handleEditFromContextMenu = useCallback(() => {
    if (
      contextMenu.groupId !== null &&
      contextMenu.dayId !== null &&
      contextMenu.hourId !== null &&
      contextMenu.lessonIndex !== null
    ) {
      onEditLesson(
        contextMenu.groupId,
        contextMenu.dayId,
        contextMenu.hourId,
        contextMenu.lessonIndex,
        contextMenu.weekTypeId,
      );
    }
    setContextMenu((c) => ({ ...c, isOpen: false }));
  }, [contextMenu, onEditLesson]);

  const handleToggleStatsPanel = useCallback(() => {
    setShowStatsPanel(prev => !prev);
  }, []);

  // MODIFIED: renderShift now takes open/setOpen and maximized/setMaximized
const renderShift = (
  shiftHours: HourType[],
  isAfternoon: boolean = false,
  open: boolean,
  setOpen: (v: boolean) => void,
  maximized: boolean,
  setMaximized: (v: boolean) => void
) => {
    // Use the exact CSS you provided for maximized
      const maximizedStyle = maximized
    ? {
        height: '100vh',
        left: 0,
        maxHeight: '100vh',
        maxWidth: '100vw',
        position: 'fixed' as const,
        top: 0,
        width: '100vw',
        zIndex: 1040,
        background: 'white',
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'column' as 'column',
        overflow: 'hidden', // Ana konteyner üçün overflow hidden
      }
    : {};
    const innerClass = maximized
      ? 'w-full h-full max-w-none max-h-none rounded-none shadow-none border-0'
      : '';
 return (
    <div
      className={`schedule-shift relative mb-8${maximized ? ' rounded-none' : ''}`}
      style={maximizedStyle}  
    >
      <div
        className={`absolute inset-0 rounded-3xl ${isAfternoon
            ? 'bg-gradient-to-br from-violet-100/40 via-purple-100/30 to-pink-100/40'
            : 'bg-gradient-to-br from-amber-100/40 via-orange-100/30 to-yellow-100/40'
          } -z-10 ${maximized ? 'rounded-none' : ''}`}
      />

      <div 
        className={`relative backdrop-blur-sm bg-white/60 rounded-lg border border-white/70 overflow-hidden ${
          maximized ? 'w-full h-full max-w-none max-h-none rounded-none shadow-none border-0 flex flex-col' : ''
        }`}
      >
        {/* Header hissəsi */}
        <div
          className={`shift-header relative px-8 py-4 ${isAfternoon
              ? 'bg-violet-500'
              : 'bg-[#FCB454]'
            } backdrop-blur-xl ${maximized ? 'flex-shrink-0' : ''}`}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isAfternoon ? (
                <Moon className="w-7 h-7 text-white" />
              ) : (
                <Sun className="w-7 h-7 text-white" />
              )}
              <div>
                <h3 className="text-2xl font-bold text-white">
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
              <button
                type="button"
                className="ml-4 p-1 rounded-full bg-white/20 hover:bg-white/40 transition"
                onClick={() => setOpen(!open)}
                aria-label={open ? "Bağla" : "Aç"}
              >
                {open
                  ? <ChevronDown className="w-6 h-6 text-white" />
                  : <ChevronRight className="w-6 h-6 text-white" />}
              </button>
              <button
                type="button"
                className="ml-2 p-1 rounded-full bg-white/20 hover:bg-white/40 transition"
                onClick={() => setMaximized(!maximized)}
                aria-label={maximized ? 'Kiçilt' : 'Maksimum et'}
              >
                {maximized
                  ? <Minimize2 className="w-6 h-6 text-white" />
                  : <Maximize2 className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Table container - maximize vəziyyətində flex-1 olacaq */}
        {open && (
          <div 
            className={`schedule-table-container ${
              maximized 
                ? 'flex-1 overflow-auto' 
                : 'overflow-x-auto'
            }`}
          >
            <div
              className={`schedule-table-scroll ${
                maximized
                  ? 'h-full overflow-auto'
                  : 'max-h-[100vh] overflow-auto'
              }`}
            >
              <table className={`border-collapse ${
                maximized 
                  ? 'w-max min-w-full' // Maximize vəziyyətində minimum full genişlik, amma məzmuna görə genişlənə bilər
                  : 'w-full'
              }`}>
                <TableHeader hours={shiftHours} />
                <tbody className="divide-y divide-slate-200/50">
                  {groups
                    .filter((group: any) => {
                      for (let dayId = 1; dayId <= 5; dayId++) {
                        const day = group.days[dayId];
                        if (!day) continue;
                        for (const hour of shiftHours) {
                          const hourObj = day.hours.find((h: any) => h.hour_id === hour.id);
                          if (hourObj && hourObj.lessons && hourObj.lessons.length > 0) {
                            return true;
                          }
                        }
                      }
                      return false;
                    })
                    .map((group: any, groupIndex: number) => (
                      <tr
                        key={group.group_id}
                        className={`transition-all duration-300 hover:bg-gradient-to-r ${isAfternoon
                            ? 'hover:from-violet-50/50 hover:to-purple-50/50'
                            : 'hover:from-amber-50/50 hover:to-orange-50/50'
                          } group`}
                      >
                        <td className={`group-name sticky left-0 z-1 bg-gradient-to-r from-slate-50/95 to-white/95 backdrop-blur-sm border-r border-slate-200/60 p-4 ${
                          maximized ? 'min-w-[150px]' : '' // Maximize vəziyyətində minimum genişlik
                        }`}>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${isAfternoon
                                  ? 'bg-gradient-to-r from-violet-200 to-purple-200'
                                  : 'bg-gradient-to-r from-amber-200 to-orange-200'
                                } shadow-lg`}
                            />
                            <span className="font-bold text-slate-700 text-sm tracking-wide whitespace-nowrap">
                              {group.group_name}
                            </span>
                          </div>
                        </td>

                        {Array.from({ length: 5 }).map((_, dayIndex: number) => {
                          const dayId = dayIndex + 1;
                          return shiftHours.map((hour: HourType) => {
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
                                onOpenContextMenu={onOpenContextMenu}
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
        )}
      </div>
    </div>
  );
};

  return (
    <div
      ref={ref}
      className="schedule-print-area min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40"
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none no-print">
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


      <div className="relative pt-4">
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={() => setContextMenu((c) => ({ ...c, isOpen: false }))}
          groupId={contextMenu.groupId}
          dayId={contextMenu.dayId}
          hourId={contextMenu.hourId}
          lessonIndex={contextMenu.lessonIndex}
          weekTypeId={contextMenu.weekTypeId}
          onEdit={handleEditFromContextMenu}
        />

        {/* Morning Shift */}
        {renderShift(morningHours, false, morningOpen, setMorningOpen, morningMaximized, setMorningMaximized)}

        {/* Afternoon Shift */}
        {renderShift(afternoonHours, true, afternoonOpen, setAfternoonOpen, afternoonMaximized, setAfternoonMaximized)}
      </div>

      {/* Floating Stats Panel */}
      {showStatsPanel ? (
        <div className="fixed bottom-8 right-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-2xl p-6 z-20 no-print">
          <button
            onClick={handleToggleStatsPanel}
            className="absolute top-2 right-2 p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200"
            aria-label="Close stats panel"
          >
            <X size={18} />
          </button>
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
      ) : (
        <button
          onClick={handleToggleStatsPanel}
          className="fixed bottom-8 right-8 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/70 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all duration-300 z-20 no-print flex items-center justify-center gap-2 text-sm font-medium"
          aria-label="Open stats panel"
          title="Open Stats Panel"
        >
          <Maximize2 size={20} />
          <span>Statistika</span>
        </button>
      )}
    </div>
  );
});

export default ScheduleTable;