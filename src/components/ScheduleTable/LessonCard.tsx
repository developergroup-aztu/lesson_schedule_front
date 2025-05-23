import React from 'react';
import { Lesson } from '../../types';
import { useSchedule } from '../../context/ScheduleContext';
import { Lock, Unlock } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  lessonIndex: number;
  groupId: number;
  dayId: number;
  hourId: number;
  weekTypeId: number;
  isMultiple: boolean;
  onOpenContextMenu: (
    e: React.MouseEvent, 
    groupId: number, 
    dayId: number, 
    hourId: number, 
    lessonIndex: number,
    weekTypeId: number
  ) => void;
  onEdit: () => void;
  onAddBeside?: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ 
  lesson, 
  lessonIndex, 
  groupId, 
  dayId, 
  hourId, 
  weekTypeId,
  isMultiple,
  onOpenContextMenu, 
  onEdit,
  onAddBeside
}) => {
  const { scheduleData } = useSchedule();
  
  const getLessonTypeClass = (typeId: number): string => {
    switch (typeId) {
      case 1: // Mühazirə
        return 'bg-blue-100 border-blue-300';
      case 2: // Məşğələ
        return 'bg-green-100 border-green-300';
      case 3: // Laboratoriya
        return 'bg-purple-100 border-purple-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getWeekTypeClass = (typeId: number): string => {
    switch (typeId) {
      case 1: // Daimi
        return 'bg-gray-600 text-white';
      case 2: // Üst həftə
        return 'bg-amber-600 text-white';
      case 3: // Alt həftə
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
  onOpenContextMenu(e, groupId, dayId, hourId, lessonIndex, weekTypeId);
};

  const handleClick = () => {
    onEdit();
  };

  return (
    <div 
      className={`${isMultiple ? 'border-r last:border-r-0 border-dashed' : ''} 
                  ${getLessonTypeClass(lesson.lesson_type_id)} 
                  p-1 rounded text-[10px] cursor-pointer transition-shadow duration-200 
                  hover:shadow-md flex-1 relative flex items-center`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium mb-0.5 truncate">{lesson.subject_name.slice(0, 10)}</div>
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-[9px]">{lesson.lesson_type_name}</span>
            <span className={`${getWeekTypeClass(lesson.week_type_id)} px-1 py-0.5 rounded text-[8px]`}>
              {lesson.week_type_name}
            </span>
          </div>
          <div className="text-gray-700 text-[9px]">
            {lesson.teacher.name} {lesson.teacher.surname}
          </div>
          <div className="flex items-center justify-between gap-1">
            <div className="bg-white px-1 py-0.5 rounded border border-gray-300 inline-block text-[8px]">
              {lesson.room.corp_name.replace(/[^0-9]/g, '')}-{lesson.room.room_name}
            </div>
            <div className="flex items-center gap-1">
              {lesson.blocked && (
                <Lock size={12} className="text-gray-500" />
              )}
              {lesson.blocked && onAddBeside && (
                <button
                  className="ml-1 px-1 py-0.5 text-xs bg-gray-100 rounded hover:bg-gray-200 border border-gray-300"
                  onClick={e => { e.stopPropagation(); onAddBeside(); }}
                  title="Dərs əlavə et"
                  style={{ marginLeft: 4 }}
                >
                  +
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;