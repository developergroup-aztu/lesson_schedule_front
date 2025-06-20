import React from 'react';
import { Lesson } from '../../types';
import { useSchedule } from '../../context/ScheduleContext';
import { Lock, Plus, MapPin, User, Clock } from 'lucide-react';

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
    weekTypeId: number,
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
  onAddBeside,
}) => {
  const { scheduleData } = useSchedule();

  const getLessonTypeClass = (typeId: number): string => {
    switch (typeId) {
      case 1: // Mühazirə
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 2: // əşğələ
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 3: // Laboratoriya
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getWeekTypeClass = (typeId: number): string => {
    switch (typeId) {
      case 1: // Daimi
        return 'bg-gray-600 text-[10px] text-nowrap text-white';
      case 2: // Üst həftə
        return 'bg-orange-500 text-[10px] text-nowrap text-white';
      case 3: // Alt həftə
        return 'bg-green-600 text-[10px] text-nowrap text-white';
      default:
        return 'bg-gray-600 text-[10px] text-nowrap text-white';
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenContextMenu(
      e,
      groupId,
      dayId,
      hourId,
      lessonIndex,
      lesson.week_type_id,
    );
  };

  const handleClick = () => {
    onEdit();
  };

  // Defensive checks for teacher and room
  const teacherName = lesson.teacher_name || lesson.teacher?.name || '';
  const teacherSurname =
    lesson.teacher_surname || lesson.teacher?.surname || '';
  const roomCorp = lesson.room_corp_name || lesson.room?.corp_name || '';
  const roomName = lesson.room_name || lesson.room?.room_name || '';

  // lock_id: 1 - kilidli, 0 - açıq
  const isLocked = lesson.lock_id === 1;

  return (
    <div
      className={`${isMultiple
          ? 'border-r-2 last:border-r-0 border-dashed border-gray-200'
          : ''
        } 
                  ${getLessonTypeClass(lesson.lesson_type_id)} 
                  p-3 rounded-lg text-xs cursor-pointer transition-colors duration-200 
                  flex-1 relative flex items-center border`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold mb-2 truncate text-gray-800 text-sm">
          {lesson.subject_name?.slice(0, 15) ?? ''}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock size={12} />
              <span className="text-[10px]">
                {lesson.lesson_type_name}
              </span>
            </div>
            <span
              className={`${getWeekTypeClass(
                lesson.week_type_id,
              )} rounded text-[10px] px-1 py-0.5 ml-2 font-medium`}
            >
              {lesson.week_type_name}
            </span>
          </div>

          {(teacherName || teacherSurname) && (
            <div className="flex items-center gap-1 text-gray-700">
              <User size={12} />
              <span className="text-xs truncate">
                {`${teacherName} ${teacherSurname}`.trim()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {(roomCorp || roomName) && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                <MapPin size={12} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {roomCorp || roomName}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {isLocked && (
                <>
                  <Lock size={12} className="text-gray-500" />
                  <button
                    className="px-1 py-0.5 text-xs bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddBeside) onAddBeside();
                    }}
                    title="Dərs əlavə et"
                    disabled={!onAddBeside}
                  >
                    <Plus size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;