import React, { useState, useEffect, useRef } from 'react';
import { Lesson } from '../../types';
import LessonCard from './LessonCard';
import { Plus } from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';

interface ScheduleCellProps {
  groupId: number;
  dayId: number;
  hourId: number;
  lessons: Lesson[] | undefined;
  onAddLesson: (groupId: number, dayId: number, hourId: number, weekTypeId: number) => void;
  onOpenContextMenu: (
    e: React.MouseEvent,
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number,
    weekTypeId: number
  ) => void;
  onEditLesson: (
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number,
    weekTypeId: number
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
  const [addMenuTarget, setAddMenuTarget] = useState<{ weekType: number; index: number } | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const emptyCellMenuRef = useRef<HTMLDivElement>(null);

  // Filter lessons by week type
  const permanentLessons = lessons.filter(lesson => lesson.week_type_id === 1);
  const upperWeekLessons = lessons.filter(lesson => lesson.week_type_id === 2);
  const lowerWeekLessons = lessons.filter(lesson => lesson.week_type_id === 3);

  // Helper to find the original lesson index in the lessons array
  const getOriginalLessonIndex = (weekTypeId: number, filteredIndex: number): number => {
    const filteredLessons = lessons.filter(lesson => lesson.week_type_id === weekTypeId);
    const lesson = filteredLessons[filteredIndex];
    return lessons.findIndex(l => l.id === lesson.id);
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
      // Check for addMenuTarget dropdown
      if (
        addMenuTarget &&
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target as Node)
      ) {
        setAddMenuTarget(null);
      }
      // Check for empty cell add menu
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
      <td className="border border-gray-300 p-1 align-top min-w-[180px]">
        <div className={`flex ${permanentLessons.length > 1 ? 'divide-x divide-gray-300' : ''} relative`}>
          {permanentLessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              lessonIndex={getOriginalLessonIndex(1, index)}
              groupId={groupId}
              dayId={dayId}
              hourId={hourId}
              weekTypeId={1}
              isMultiple={permanentLessons.length > 1}
              onOpenContextMenu={onOpenContextMenu}
              onEdit={() => onEditLesson(groupId, dayId, hourId, getOriginalLessonIndex(1, index), 1)}
              onAddBeside={lesson.blocked ? () => handleAddBeside(1, index) : undefined}
            />
          ))}
          {addMenuTarget && addMenuTarget.weekType === 1 && (
            <div
              ref={addMenuRef}
              className="absolute bg-white border rounded shadow p-1 z-10 flex flex-col gap-1 right-0 top-full"
            >
              <button
                onClick={() => handleAddBesideLesson(1)}
                className="px-2 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200"
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
  if ((upperWeekLessons.length > 0 || lowerWeekLessons.length > 0 || forceSplit) && !(permanentLessons.length > 0 && !forceSplit)) {
    return (
      <td className="border border-gray-300 p-0 align-top min-w-[180px]">
        <div className="flex flex-col h-full divide-y divide-gray-300">
          {/* Upper week section */}
          <div className="p-1 min-h-[60px] relative">
            <div className={`flex ${upperWeekLessons.length > 1 ? 'divide-x divide-gray-300' : ''} relative`}>
              {upperWeekLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  lessonIndex={getOriginalLessonIndex(2, index)}
                  groupId={groupId}
                  dayId={dayId}
                  hourId={hourId}
                  weekTypeId={2}
                  isMultiple={upperWeekLessons.length > 1}
                  onOpenContextMenu={onOpenContextMenu}
                  onEdit={() => onEditLesson(groupId, dayId, hourId, getOriginalLessonIndex(2, index), 2)}
                  onAddBeside={lesson.blocked ? () => handleAddBeside(2, index) : undefined}
                />
              ))}
              {upperWeekLessons.length === 0 && (
                <button
                  onClick={() => onAddLesson(groupId, dayId, hourId, 2)}
                  className="ml-1 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity duration-200 text-[10px]"
                >
                  Üst +
                </button>
              )}
              {addMenuTarget && addMenuTarget.weekType === 2 && (
                <div
                  ref={addMenuRef}
                  className="absolute bg-white border rounded shadow p-1 z-10 flex flex-col gap-1 right-0 top-full"
                >
                  <button
                    onClick={() => handleAddBesideLesson(2)}
                    className="px-2 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Üst həftə
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Alt hefte sectionu */}
          <div className="p-1 min-h-[60px] relative">
            <div className={`flex ${lowerWeekLessons.length > 1 ? 'divide-x divide-gray-300' : ''} relative`}>
              {lowerWeekLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  lessonIndex={getOriginalLessonIndex(3, index)}
                  groupId={groupId}
                  dayId={dayId}
                  hourId={hourId}
                  weekTypeId={3}
                  isMultiple={lowerWeekLessons.length > 1}
                  onOpenContextMenu={onOpenContextMenu}
                  onEdit={() => onEditLesson(groupId, dayId, hourId, getOriginalLessonIndex(3, index), 3)}
                  onAddBeside={lesson.blocked ? () => handleAddBeside(3, index) : undefined}
                />
              ))}
              {lowerWeekLessons.length === 0 && (
                <button
                  onClick={() => onAddLesson(groupId, dayId, hourId, 3)}
                  className="ml-1 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity duration-200 text-[10px]"
                >
                  Alt +
                </button>
              )}
              {addMenuTarget && addMenuTarget.weekType === 3 && (
                <div
                  ref={addMenuRef}
                  className="absolute bg-white border rounded shadow p-1 z-10 flex flex-col gap-1 right-0 top-full"
                >
                  <button
                    onClick={() => handleAddBesideLesson(3)}
                    className="px-2 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200"
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

  // bos xanalara + buttonu ve hefte secimleri buttonu 
  if (lessons.length === 0) {
    return (
      <td className="border border-gray-300 p-1 align-top min-w-[180px]">
        {showAddMenu ? (
          <div ref={emptyCellMenuRef} className="flex flex-col gap-1 items-center justify-center">
            <button
              onClick={() => {
                setShowAddMenu(false);
                setForceSplit(false);
                onAddLesson(groupId, dayId, hourId, 1);
              }}
              className="px-2 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200 mb-1"
            >
              Daimi
            </button>
            <button
              onClick={() => {
                setShowAddMenu(false);
                setForceSplit(true);
                onAddLesson(groupId, dayId, hourId, 2);
              }}
              className="px-2 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200 mb-1"
            >
              Üst həftə
            </button>
            <button
              onClick={() => {
                setShowAddMenu(false);
                setForceSplit(true);
                onAddLesson(groupId, dayId, hourId, 3);
              }}
              className="px-2 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200"
            >
              Alt həftə
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMenu(true)}
            className="w-full h-full flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity duration-200"
          >
            <Plus size={14} />
          </button>
        )}
      </td>
    );
  }

  return <td className="border border-gray-300 p-1 align-top min-w-[180px]"></td>;
};

export default ScheduleCell;