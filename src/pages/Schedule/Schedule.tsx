import { useEffect, useState, useRef } from 'react';
import Header from '../../components/Header';
import ScheduleTable, { ScheduleTableHandle } from '../../components/ScheduleTable/ScheduleTable';
import LessonModal from '../../components/ScheduleModal/LessonModal';
import ContextMenu from '../../components/ContextMenu';
import { useSchedule } from '../../context/ScheduleContext';
import EditLessonModal from '../../components/ScheduleModal/EditLessonModal';
import usePermissions from '../../hooks/usePermissions';
import {
  Calendar,
  BookOpen,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

function Schedule() {
  const { scheduleData, refreshSchedule } = useSchedule();

  const scheduleTableRef = useRef<ScheduleTableHandle | null>(null);

  const [savedScroll, setSavedScroll] = useState({
    windowX: 0,
    windowY: 0,
    tableLeft: 0,
    tableTop: 0,
  });

  const saveScrollPositions = () => {
    const tablePos = scheduleTableRef.current?.getScrollPosition() || { left: 0, top: 0 };
    setSavedScroll({
      windowX: window.scrollX,
      windowY: window.scrollY,
      tableLeft: tablePos.left,
      tableTop: tablePos.top,
    });
  };

  const restoreScrollPositions = () => {
    requestAnimationFrame(() => {
      scheduleTableRef.current?.setScrollPosition({ left: savedScroll.tableLeft, top: savedScroll.tableTop });
      window.scrollTo(savedScroll.windowX, savedScroll.windowY);
    });
  };

  const [modalData, setModalData] = useState({
    isOpen: false,
    groupId: null,
    groupName: null,
    dayId: null,
    dayName: null,
    hourId: null,
    hourName: null,
    lessonIndex: null,
    lesson: null,
    mode: 'add',
    weekTypeId: null,
    schedule_group_id: null,
  });

  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    groupId: null,
    dayId: null,
    hourId: null,
    lessonIndex: null,
    weekTypeId: null,
  });

  const canEditSchedule = usePermissions('edit_schedule');
  const canAddSchedule = usePermissions('add_schedule');


  const getCurrentWeekType = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const semesterStart = new Date(currentYear, 8, 15);
    const secondSemesterStart = new Date(currentYear + 1, 1, 16);
    let startDate;

    if (currentDate >= semesterStart && currentDate < secondSemesterStart) {
      startDate = semesterStart;
    } else if (currentDate >= secondSemesterStart) {
      startDate = secondSemesterStart;
    } else {
      startDate = new Date(currentYear, 1, 16);
    }

    const timeDiff = currentDate.getTime() - startDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const weeksPassed = Math.floor(daysDiff / 7);

    return weeksPassed % 2 === 0 ? 'Üst' : 'Alt';
  };

  const getCurrentSemester = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const fallStart = new Date(year, 8, 15);
    const springStart = new Date(year + 1, 1, 16);

    if (currentDate >= fallStart && currentDate < springStart) {
      return 'Payız Semestri';
    } else {
      return 'Yaz Semestri';
    }
  };

  const currentSemester = getCurrentSemester();

  const currentWeekType = getCurrentWeekType();

  const handleAddLesson = (
    groupId = null,
    dayId = null,
    hourId = null,
    weekTypeId = 1,
  ) => {
    saveScrollPositions();
    let groupName = null;
    let dayName = null;
    let hourName = null;

    if (groupId) {
      const group = scheduleData.groups.find((g) => g.group_id === groupId);
      groupName = group ? group.group_name : null;

      if (dayId !== null && group?.days[dayId]) {
        dayName = group.days[dayId].day_name;
      }

      if (hourId !== null && group?.days[dayId]?.hours) {
        const hour = group.days[dayId].hours.find((h) => h.hour_id === hourId);
        hourName = hour ? hour.hour_value : null;
      }
    }

    setModalData({
      isOpen: true,
      groupId,
      groupName,
      dayId,
      dayName,
      hourId,
      hourName,
      lessonIndex: null,
      lesson: null,
      weekTypeId,
      mode: 'add',
      schedule_group_id: null,
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      console.log("Scroll Y:", y);
    };

    window.addEventListener("scroll", handleScroll);

    // cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);



  const handleEditLesson = (
    groupId,
    dayId,
    hourId,
    lessonIndex,
    weekTypeId = 1,
  ) => {
    saveScrollPositions();
    const group = scheduleData.groups.find((g) => g.group_id === groupId);
    const day = group?.days[dayId];
    const hour = day?.hours.find((h) => h.hour_id === hourId);
    const lesson = hour?.lessons[lessonIndex] || null;

    if (lesson?.parent_group) {
      Swal.fire({
        icon: 'warning',
        title: 'Redaktə mümkün deyil',
        text: 'Bu dərs birləşdirilmiş qrupdandır və redaktə edilə bilməz.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    const groupName = group ? group.group_name : null;
    const dayName = day ? day.day_name : null;
    const hourName = hour ? hour.hour_value : null;

    setModalData({
      isOpen: true,
      groupId,
      groupName,
      dayId,
      dayName,
      hourId,
      hourName,
      lessonIndex,
      lesson,
      weekTypeId,
      mode: 'edit',
      schedule_group_id: lesson?.schedule_group_id || null,
    });
  };

  const handleOpenContextMenu = (
    e,
    groupId,
    dayId,
    hourId,
    lessonIndex,
    weekTypeId = null,
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

  const handleCloseModal = () => {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleEditFromContextMenu = () => {
    console.log('contextMenu', contextMenu);

    if (
      contextMenu.groupId !== null &&
      contextMenu.dayId !== null &&
      contextMenu.hourId !== null &&
      contextMenu.lessonIndex !== null
    ) {
      handleEditLesson(
        contextMenu.groupId,
        contextMenu.dayId,
        contextMenu.hourId,
        contextMenu.lessonIndex,
        contextMenu.weekTypeId,
      );
    }
    handleCloseContextMenu();
  };

  const totalLessons = scheduleData.groups.reduce((total, group) => {
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
  }, 0);

  const activeGroups = scheduleData.groups.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
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
          <Header onAddLesson={() => handleAddLesson()} />

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
                      2025-2026
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

                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md rounded-lg px-4 py-3 sm:px-6 sm:py-3 border border-white/60 shadow-md w-full sm:w-auto">
                  <div
                    className={`p-2 rounded-lg ${currentWeekType === 'Üst'
                      ? 'bg-violet-400'
                      : 'bg-pink-400'
                      }`}
                  >
                    {currentWeekType === 'Üst' ? (
                      <TrendingUp className="w-5 h-5 text-purple-800" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-800" />
                    )}
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">
                      Cari Həftə
                    </p>
                    <p
                      className={`text-lg font-bold ${currentWeekType === 'Üst'
                        ? 'text-purple-800'
                        : 'text-rose-800'
                        }`}
                    >
                      {currentWeekType} Həftə
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      {currentSemester}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="">
        <div className="schedule-print-area">
          <ScheduleTable
            ref={scheduleTableRef}
            onAddLesson={handleAddLesson}
            onOpenContextMenu={handleOpenContextMenu}
            onEditLesson={handleEditLesson}
          />
        </div>
      </main>

      <div className="fixed bottom-8 left-8 z-30"></div>
      {modalData.mode === 'add' && canAddSchedule ? (
        <LessonModal
          isOpen={modalData.isOpen}
          onClose={handleCloseModal}
          modalData={modalData}
          mode={modalData.mode}
          onSuccess={() => Promise.resolve(refreshSchedule()).then(restoreScrollPositions)}
        />
      )
        // 2. Əks halda, əgər rejim 'add' deyilsə (yəni 'edit' və ya başqa bir şeydirsə) VƏ istifadəçinin dəyişdirmə icazəsi varsa:
        : modalData.mode !== 'add' && canEditSchedule ? (
          <EditLessonModal
            isOpen={modalData.isOpen}
            onClose={handleCloseModal}
            modalData={modalData}
            mode={modalData.mode}
            onSuccess={() => Promise.resolve(refreshSchedule()).then(restoreScrollPositions)}
          />
        )
          // 3. Əks halda (əgər icazə yoxdursa və ya modalData.isOpen = false) heç nə göstərmə.
          : null}

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={handleCloseContextMenu}
        groupId={contextMenu.groupId}
        dayId={contextMenu.dayId}
        hourId={contextMenu.hourId}
        lessonIndex={contextMenu.lessonIndex}
        weekTypeId={contextMenu.weekTypeId}
        onEdit={handleEditFromContextMenu}
      />
    </div>
  );
}

export default Schedule;