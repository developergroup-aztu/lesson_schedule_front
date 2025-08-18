import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson } from '../../types';
import LessonCard from './LessonCard';
import { Plus, Calendar } from 'lucide-react';

interface ScheduleCellProps {
  groupId: number;
  dayId: number;
  hourId: number;
  lessons?: Lesson[];
  onAddLesson: (groupId: number, dayId: number, hourId: number, weekTypeId: number) => void;
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
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [forceSplit, setForceSplit] = useState(false);
  const [addMenuTarget, setAddMenuTarget] = useState<{ weekType: number; index: number } | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const emptyCellMenuRef = useRef<HTMLDivElement>(null);

  // Filter lessons by week type - Use memoization if `lessons` array is large and changes frequently
  const permanentLessons = lessons.filter((lesson) => lesson.week_type_id === 1);
  const upperWeekLessons = lessons.filter((lesson) => lesson.week_type_id === 2);
  const lowerWeekLessons = lessons.filter((lesson) => lesson.week_type_id === 3);

  const getOriginalLessonIndex = useCallback(
    (weekTypeId: number, filteredIndex: number): number => {
      const filtered = lessons.filter((lesson) => lesson.week_type_id === weekTypeId);
      const lesson = filtered[filteredIndex];
      const uniqueId = lesson?.schedule_group_id ?? lesson?.schedule_id;
      return lessons.findIndex((l) => (l.schedule_group_id ?? l.schedule_id) === uniqueId);
    },
    [lessons],
  );

  const handleAddBeside = useCallback((weekType: number, index: number) => {
    setAddMenuTarget({ weekType, index });
  }, []);

  const handleAddBesideLesson = useCallback(
    (weekTypeId: number) => {
      if (addMenuTarget) {
        setAddMenuTarget(null);
        setForceSplit(weekTypeId !== 1);
        onAddLesson(groupId, dayId, hourId, weekTypeId);
      }
    },
    [addMenuTarget, groupId, dayId, hourId, onAddLesson],
  );

  const handleAddLessonClick = useCallback(
    (weekTypeId: number, shouldForceSplit: boolean) => {
      setShowAddMenu(false);
      setForceSplit(shouldForceSplit);
      onAddLesson(groupId, dayId, hourId, weekTypeId);
    },
    [groupId, dayId, hourId, onAddLesson],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuTarget && addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setAddMenuTarget(null);
      }
      if (showAddMenu && emptyCellMenuRef.current && !emptyCellMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addMenuTarget, showAddMenu]);

  // Helper component for rendering LessonCards and their associated add menu
  const LessonSection: React.FC<{
    lessons: Lesson[];
    weekTypeId: number;
    emptyText: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    addMenuBg: string;
    addMenuBorder: string;
  }> = ({ lessons, weekTypeId, emptyText, bgColor, borderColor, textColor, addMenuBg, addMenuBorder }) => (
    <div className={`flex gap-2 ${lessons.length > 1 ? 'space-x-1' : ''} relative`}>
      {lessons.map((lesson, index) => (
        <LessonCard
          key={lesson.schedule_group_id ?? lesson.schedule_id}
          lesson={lesson}
          lessonIndex={getOriginalLessonIndex(weekTypeId, index)}
          groupId={groupId}
          dayId={dayId}
          hourId={hourId}
          weekTypeId={weekTypeId}
          isMultiple={lessons.length > 1}
          onOpenContextMenu={onOpenContextMenu}
          onEdit={() =>
            onEditLesson(groupId, dayId, hourId, getOriginalLessonIndex(weekTypeId, index), weekTypeId)
          }
          onAddBeside={lesson.lock_id === 1 ? () => handleAddBeside(weekTypeId, index) : undefined}
        />
      ))}
      {lessons.length === 0 && (
        <button
          onClick={() => onAddLesson(groupId, dayId, hourId, weekTypeId)}
          className={`flex items-center justify-center gap-1 text-xs ${textColor} hover:${textColor.replace(
            'text-',
            'text-hover-',
          )} bg-white hover:${bgColor} rounded border ${borderColor} px-2 py-1 transition-colors`}
        >
          <Plus size={12} />
          {emptyText}
        </button>
      )}
      {addMenuTarget && addMenuTarget.weekType === weekTypeId && (
        <div
          ref={addMenuRef}
          className={`absolute bg-white border ${addMenuBorder} rounded-lg shadow-lg z-20 flex flex-col gap-1 -right-7 top-[75%] mt-1`}
        >
          <button
            onClick={() => handleAddBesideLesson(weekTypeId)}
            className={`px-1 py-1 text-xs ${addMenuBg} rounded hover:${addMenuBg.replace(
              '-50',
              '-100',
            )} transition-colors ${textColor} ${addMenuBorder}`}
          >
            {emptyText} həftə
          </button>
        </div>
      )}
    </div>
  );

  // Render Logic
  const shouldSplitCell =
    (upperWeekLessons.length > 0 || lowerWeekLessons.length > 0 || forceSplit) &&
    !(permanentLessons.length > 0 && !forceSplit);

  if (permanentLessons.length > 0 && !forceSplit) {
    return (
      <td className="border border-gray-300 p-1 min-w-[200px] bg-white">
        <LessonSection
          lessons={permanentLessons}
          weekTypeId={1}
          emptyText="Daimi"
          bgColor="bg-gray-50"
          borderColor="border-gray-200"
          textColor="text-gray-600"
          addMenuBg="bg-gray-100" // Not directly used by the button in this section, but kept for consistency
          addMenuBorder="border-gray-200"
        />
      </td>
    );
  }

  if (shouldSplitCell) {
    return (
      <td className="split-cell border border-gray-200 p-0 min-w-[200px] bg-white">
        <div className="flex flex-col h-full">
          <div className="split-section upper-week-section p-1 min-h-[80px] relative border-b border-gray-200 bg-orange-25">
            <LessonSection
              lessons={upperWeekLessons}
              weekTypeId={2}
              emptyText="Üst"
              bgColor="bg-orange-50"
              borderColor="border-orange-200"
              textColor="text-orange-600"
              addMenuBg="bg-orange-50"
              addMenuBorder="border-orange-200"
            />
          </div>

          <div className="split-section lower-week-section p-1 min-h-[80px] relative bg-green-25">
            <LessonSection
              lessons={lowerWeekLessons}
              weekTypeId={3}
              emptyText="Alt"
              bgColor="bg-green-50"
              borderColor="border-green-200"
              textColor="text-green-600"
              addMenuBg="bg-green-50"
              addMenuBorder="border-green-200"
            />
          </div>
        </div>
      </td>
    );
  }

  // Empty cell
  return (
    <td className="border border-gray-200 p-1 min-w-[200px] bg-white">
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
            onClick={() => handleAddLessonClick(1, false)}
            className="w-full px-4 py-2 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors text-gray-700 border border-gray-200"
          >
            Daimi dərs
          </button>
          <button
            onClick={() => handleAddLessonClick(2, true)}
            className="w-full px-4 py-2 text-xs bg-orange-100 rounded hover:bg-orange-200 transition-colors text-orange-700 border border-orange-200"
          >
            Üst həftə
          </button>
          <button
            onClick={() => handleAddLessonClick(3, true)}
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
};

export default ScheduleCell;