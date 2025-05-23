import React, { useState } from 'react';
import { Lesson } from '../../types';
import LessonCard from './LessonCard';
import { Plus } from 'lucide-react';

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
    lessonIndex: number
  ) => void;
}

const ScheduleCell: React.FC<ScheduleCellProps> = ({ 
  groupId, 
  dayId, 
  hourId, 
  lessons = [], 
  onAddLesson,
  onOpenContextMenu,
  onEditLesson
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [forceSplit, setForceSplit] = useState(false);
  const [addMenuTarget, setAddMenuTarget] = useState<{weekType: number, index: number} | null>(null);

  // Filter lessons by week type
  const permanentLessons = lessons.filter(lesson => lesson.week_type_id === 1);
  const upperWeekLessons = lessons.filter(lesson => lesson.week_type_id === 2);
  const lowerWeekLessons = lessons.filter(lesson => lesson.week_type_id === 3);

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

  // If daimi lesson exists and not splitting, show as single cell
  if (permanentLessons.length > 0 && !forceSplit) {
    return (
      <td className="border border-gray-300 p-1 align-top min-w-[180px]">
        <div className={`flex ${permanentLessons.length > 1 ? 'divide-x divide-gray-300' : ''} relative`}>
          {permanentLessons.map((lesson, index) => (
            <LessonCard
              key={index}
              lesson={lesson}
              lessonIndex={index}
              groupId={groupId}
              dayId={dayId}
              hourId={hourId}
              isMultiple={permanentLessons.length > 1}
              onOpenContextMenu={onOpenContextMenu}
                weekTypeId={1} // Daimi üçün

              onEdit={() => onEditLesson(groupId, dayId, hourId, index)}
              onAddBeside={lesson.blocked ? () => handleAddBeside(1, index) : undefined}
            />
          ))}
          {/* Add menu beside a blocked lesson (only for daimi) */}
          {addMenuTarget && addMenuTarget.weekType === 1 && (
            <div className="absolute bg-white border rounded shadow p-1 z-10 flex flex-col gap-1 right-0 top-full">
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
                  key={index}
                  lesson={lesson}
                  lessonIndex={index}
                  groupId={groupId}
                  dayId={dayId}
                  hourId={hourId}
                  isMultiple={upperWeekLessons.length > 1}
                  onOpenContextMenu={onOpenContextMenu}
                    weekTypeId={2} // Daimi üçün

                  onEdit={() => onEditLesson(groupId, dayId, hourId, index)}
                  onAddBeside={lesson.blocked ? () => handleAddBeside(2, index) : undefined}
                />
              ))}
              {/* If section is empty, show add button */}
              {upperWeekLessons.length === 0 && (
                <button
                  onClick={() => onAddLesson(groupId, dayId, hourId, 2)}
                  className="ml-1 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity duration-200 text-[10px]"
                >
                  Üst +
                </button>
              )}
              {/* Add menu beside a blocked lesson (only for upper week) */}
              {addMenuTarget && addMenuTarget.weekType === 2 && (
                <div className="absolute bg-white border rounded shadow p-1 z-10 flex flex-col gap-1 right-0 top-full">
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

          {/* Lower week section */}
          <div className="p-1 min-h-[60px] relative">
            <div className={`flex ${lowerWeekLessons.length > 1 ? 'divide-x divide-gray-300' : ''} relative`}>
              {lowerWeekLessons.map((lesson, index) => (
                <LessonCard
                  key={index}
                  lesson={lesson}
                  lessonIndex={index}
                  groupId={groupId}
                  dayId={dayId}
                  hourId={hourId}
                  isMultiple={lowerWeekLessons.length > 1}
                  onOpenContextMenu={onOpenContextMenu}
                    weekTypeId={3} // alt həftə üçün
                  onEdit={() => onEditLesson(groupId, dayId, hourId, index)}
                  onAddBeside={lesson.blocked ? () => handleAddBeside(3, index) : undefined}
                />
              ))}
              {/* If section is empty, show add button */}
              {lowerWeekLessons.length === 0 && (
                <button
                  onClick={() => onAddLesson(groupId, dayId, hourId, 3)}
                  className="ml-1 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity duration-200 text-[10px]"
                >
                  Alt +
                </button>
              )}
              {/* Add menu beside a blocked lesson (only for lower week) */}
              {addMenuTarget && addMenuTarget.weekType === 3 && (
                <div className="absolute bg-white border rounded shadow p-1 z-10 flex flex-col gap-1 right-0 top-full">
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

  // Empty cell with add button and week type selection
  if (lessons.length === 0) {
    return (
      <td className="border border-gray-300 p-1 align-top min-w-[180px]">
        {showAddMenu ? (
          <div className="flex flex-col gap-1 items-center justify-center">
            <button
              onClick={() => { setShowAddMenu(false); setForceSplit(false); onAddLesson(groupId, dayId, hourId, 1); }}
              className="px-2 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200 mb-1"
            >
              Daimi
            </button>
            <button
              onClick={() => { setShowAddMenu(false); setForceSplit(true); onAddLesson(groupId, dayId, hourId, 2); }}
              className="px-2 py-1 text-[10px] bg-gray-100 rounded hover:bg-gray-200 mb-1"
            >
              Üst həftə
            </button>
            <button
              onClick={() => { setShowAddMenu(false); setForceSplit(true); onAddLesson(groupId, dayId, hourId, 3); }}
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

  // fallback (should not happen)
  return (
    <td className="border border-gray-300 p-1 align-top min-w-[180px]">
      {/* fallback */}
    </td>
  );
};

export default ScheduleCell;