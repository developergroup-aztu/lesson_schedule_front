import React, { useState, useEffect, useRef } from 'react';
import { Lesson } from '../../types';
import LessonCard from './LessonCard';
import { Plus, Calendar } from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';

interface ScheduleCellProps {
  groupId: number;
  dayId: number;
  hourId: number;
  lessons: Lesson[] | undefined;
  onAddLesson: (
    groupId: number,
    dayId: number,
    hourId: number,
    weekTypeId: number,
  ) => void;
  onOpenContextMenu: (
    e: React.MouseEvent,
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number,
    weekTypeId: number,
  ) => void;
  onEditLesson: (
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number,
    weekTypeId: number,
  ) => void;
}

const ScheduleCell: React.FC<ScheduleCellProps> = ({
  groupId,
  dayId,
  hourId,
  lessons = [],
  onAddLesson,
  onOpenContextMenu,
  onEditLesson,
}) => {
  const { scheduleData } = useSchedule();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [forceSplit, setForceSplit] = useState(false);
  const [addMenuTarget, setAddMenuTarget] = useState<{
    weekType: number;
    index: number;
  } | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const emptyCellMenuRef = useRef<HTMLDivElement>(null);

  // Filter lessons by week type
  const permanentLessons = lessons.filter(
    (lesson) => lesson.week_type_id === 1,
  );
  const upperWeekLessons = lessons.filter(
    (lesson) => lesson.week_type_id === 2,
  );
  const lowerWeekLessons = lessons.filter(
    (lesson) => lesson.week_type_id === 3,
  );

  // Helper to find the original lesson index in the lessons array
  const getOriginalLessonIndex = (
    weekTypeId: number,
    filteredIndex: number,
  ): number => {
    const filteredLessons = lessons.filter(
      (lesson) => lesson.week_type_id === weekTypeId,
    );
    const lesson = filteredLessons[filteredIndex];
    const uniqueId = lesson?.schedule_group_id ?? lesson?.schedule_id;
    return lessons.findIndex(
      (l) => (l.schedule_group_id ?? l.schedule_id) === uniqueId,
    );
  };

  // Helper to open add menu beside a lesson
  const handleAddBeside = (weekType: number, index: number) => {
    setAddMenuTarget({ weekType, index });
  };

  // Helper to actually add beside
  const handleAddBesideLesson = (weekTypeId: number) => {
    if (addMenuTarget) {
      setAddMenuTarget(null);
      setForceSplit(weekTypeId !== 1);
      onAddLesson(groupId, dayId, hourId, weekTypeId);
    }
  };

  // Close addMenuTarget and showAddMenu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addMenuTarget &&
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target as Node)
      ) {
        setAddMenuTarget(null);
      }
      if (
        showAddMenu &&
        emptyCellMenuRef.current &&
        !emptyCellMenuRef.current.contains(event.target as Node)
      ) {
        setShowAddMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [addMenuTarget, showAddMenu]);

  // If daimi lesson exists and not splitting, show as single cell
  if (permanentLessons.length > 0 && !forceSplit) {
    return (
      <td className="border border-gray-200 p-2 min-w-[200px] bg-white">
        <div className={`flex gap-2 ${permanentLessons.length > 1 ? 'space-x-1' : ''} relative`}>
          {permanentLessons.map((lesson, index) => (
            <LessonCard
              key={lesson.schedule_group_id ?? lesson.schedule_id}
              lesson={lesson}
              lessonIndex={getOriginalLessonIndex(1, index)}
              groupId={groupId}
              dayId={dayId}
              hourId={hourId}
              weekTypeId={1}
              isMultiple={permanentLessons.length > 1}
              onOpenContextMenu={onOpenContextMenu}
              onEdit={() =>
                onEditLesson(
                  groupId,
                  dayId,
                  hourId,
                  getOriginalLessonIndex(1, index),
                  1,
                )
              }
              onAddBeside={
                lesson.lock_id === 1
                  ? () => handleAddBeside(1, index)
                  : undefined
              }
            />
          ))}
          {addMenuTarget && addMenuTarget.weekType === 1 && (
            <div
              ref={addMenuRef}
              className="absolute bg-white border  rounded-lg   z-20 flex flex-col gap-1  -right-7 top-[75%] mt-1"
            >
              <button
                onClick={() => handleAddBesideLesson(1)}
                className="px-1 py-1  text-xs rounded hover:bg-gray-100 transition-colors text-gray-700 border border-gray-200"
              >
                Daimi
              </button>
            </div>
          )}
        </div>
      </td>
    );
  }

  // If both upper and lower week lessons exist, or forceSplit is true, split cell
  if (
    (upperWeekLessons.length > 0 ||
      lowerWeekLessons.length > 0 ||
      forceSplit) &&
    !(permanentLessons.length > 0 && !forceSplit)
  ) {
    return (
      <td className="border border-gray-200 p-0 min-w-[200px] bg-white">
        <div className="flex flex-col h-full">
          {/* Upper week section */}
          <div className="p-2 min-h-[80px] relative border-b border-gray-200 bg-orange-25">
            <div className={`flex gap-2 ${upperWeekLessons.length > 1 ? 'space-x-1' : ''} relative`}>
              {upperWeekLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.schedule_group_id ?? lesson.schedule_id}
                  lesson={lesson}
                  lessonIndex={getOriginalLessonIndex(2, index)}
                  groupId={groupId}
                  dayId={dayId}
                  hourId={hourId}
                  weekTypeId={2}
                  isMultiple={upperWeekLessons.length > 1}
                  onOpenContextMenu={onOpenContextMenu}
                  onEdit={() =>
                    onEditLesson(
                      groupId,
                      dayId,
                      hourId,
                      getOriginalLessonIndex(2, index),
                      2,
                    )
                  }
                  onAddBeside={
                    lesson.lock_id === 1
                      ? () => handleAddBeside(2, index)
                      : undefined
                  }
                />
              ))}
              {upperWeekLessons.length === 0 && (
                <button
                  onClick={() => onAddLesson(groupId, dayId, hourId, 2)}
                  className="flex items-center justify-center gap-1 text-xs text-orange-600 hover:text-orange-700 bg-white hover:bg-orange-50 rounded border border-orange-200 px-2 py-1 transition-colors"
                >
                  <Plus size={12} />
                  Üst
                </button>
              )}
              {addMenuTarget && addMenuTarget.weekType === 2 && (
                <div
                  ref={addMenuRef}
                  className="absolute bg-white border  rounded-lg shadow-lg z-20 flex flex-col gap-1 -right-12 top-[75%] mt-1"
                >
                  <button
                    onClick={() => handleAddBesideLesson(2)}
                    className="px-1 py-1 text-xs bg-orange-50 rounded hover:bg-orange-100 transition-colors text-orange-700 border border-orange-200"
                  >
                    Üst həftə
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Alt həftə section */}
          <div className="p-2 min-h-[80px] relative bg-green-25">
            <div className={`flex gap-2 ${lowerWeekLessons.length > 1 ? 'space-x-1' : ''} relative`}>
              {lowerWeekLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.schedule_group_id ?? lesson.schedule_id}
                  lesson={lesson}
                  lessonIndex={getOriginalLessonIndex(3, index)}
                  groupId={groupId}
                  dayId={dayId}
                  hourId={hourId}
                  weekTypeId={3}
                  isMultiple={lowerWeekLessons.length > 1}
                  onOpenContextMenu={onOpenContextMenu}
                  onEdit={() =>
                    onEditLesson(
                      groupId,
                      dayId,
                      hourId,
                      getOriginalLessonIndex(3, index),
                      3,
                    )
                  }
                  onAddBeside={
                    lesson.lock_id === 1
                      ? () => handleAddBeside(3, index)
                      : undefined
                  }
                />
              ))}
              {lowerWeekLessons.length === 0 && (
                <button
                  onClick={() => onAddLesson(groupId, dayId, hourId, 3)}
                  className="flex items-center justify-center gap-1 text-xs text-green-600 hover:text-green-700 bg-white hover:bg-green-50 rounded border border-green-200 px-2 py-1 transition-colors"
                >
                  <Plus size={12} />
                  Alt
                </button>
              )}
              {addMenuTarget && addMenuTarget.weekType === 3 && (
                <div
                  ref={addMenuRef}
                  className="absolute bg-white border  rounded-lg shadow-lg z-20 flex flex-col gap-1 -right-[45px] top-[75%] mt-1"
                >
                  <button
                    onClick={() => handleAddBesideLesson(3)}
                    className="px-1 py-1 text-xs bg-green-50 rounded hover:bg-green-100 transition-colors text-green-700 border border-green-200"
                  >
                    Alt həftə
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
    );
  }

  // Boş xanalar üçün + button və həftə seçimləri
  if (lessons.length === 0) {
    return (
      <td className="border border-gray-200 p-2 min-w-[200px] bg-white">
        {showAddMenu ? (
          <div
            ref={emptyCellMenuRef}
            className="flex flex-col gap-2 items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <Calendar size={16} />
              <span className="text-xs font-medium">Dərs növü seçin</span>
            </div>
            <button
              onClick={() => {
                setShowAddMenu(false);
                setForceSplit(false);
                onAddLesson(groupId, dayId, hourId, 1);
              }}
              className="w-full px-4 py-2 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors text-gray-700 border border-gray-200"
            >
              Daimi dərs
            </button>
            <button
              onClick={() => {
                setShowAddMenu(false);
                setForceSplit(true);
                onAddLesson(groupId, dayId, hourId, 2);
              }}
              className="w-full px-4 py-2 text-xs bg-orange-100 rounded hover:bg-orange-200 transition-colors text-orange-700 border border-orange-200"
            >
              Üst həftə
            </button>
            <button
              onClick={() => {
                setShowAddMenu(false);
                setForceSplit(true);
                onAddLesson(groupId, dayId, hourId, 3);
              }}
              className="w-full px-4 py-2 text-xs bg-green-100 rounded hover:bg-green-200 transition-colors text-green-700 border border-green-200"
            >
              Alt həftə
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMenu(true)}
            className="w-full h-full min-h-[100px] flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded border-2 border-dashed border-gray-300"
          >
            <Plus size={18} className="mb-1" />
            <span className="text-xs">Dərs əlavə et</span>
          </button>
        )}
      </td>
    );
  }

  return (
    <td className="border border-gray-200 p-2 min-w-[200px] bg-white"></td>
  );
};

export default ScheduleCell;