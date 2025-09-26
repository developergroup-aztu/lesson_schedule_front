import React from 'react';
import { Lesson } from '../../types';
import { Lock, Plus, MapPin, User, Clock } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  lessonIndex: number;
  groupId: number;
  dayId: number;
  hourId: number;
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

const LESSON_TYPE_CLASSES: { [key: number]: string } = {
  1: 'bg-blue-50 border-blue-200 hover:bg-blue-100', // Mühazirə
  2: 'bg-green-50 border-green-200 hover:bg-green-100', // Məşğələ
  3: 'bg-purple-50 border-purple-200 hover:bg-purple-100', // Laboratoriya
};

const WEEK_TYPE_CLASSES: { [key: number]: string } = {
  1: 'bg-gray-600', // Daimi
  2: 'bg-orange-500', // Üst həftə
  3: 'bg-green-600', // Alt həftə
};

const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  lessonIndex,
  groupId,
  dayId,
  hourId,
  isMultiple,
  onOpenContextMenu,
  onEdit,
  onAddBeside,
}) => {
  const {
    lesson_name,
    lesson_type_id,
    lesson_type_name,
    week_type_id,
    week_type_name,
    teacher_name: propTeacherName,
    teacher_surname: propTeacherSurname,
    teacher,
    corp_id: propCorpId,
    room_name: propRoomName,
    room,
    lock_id,
    parent_group
  } = lesson;

  const getClassName = (map: { [key: number]: string }, id: number, defaultClass: string) =>
    map[id] || defaultClass;

  const lessonTypeClass = getClassName(LESSON_TYPE_CLASSES, lesson_type_id, 'bg-gray-50 border-gray-200 hover:bg-gray-100');
  const weekTypeClass = getClassName(WEEK_TYPE_CLASSES, week_type_id, 'bg-gray-600');

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenContextMenu(e, groupId, dayId, hourId, lessonIndex, week_type_id);
  };

  const teacherFullName = `${propTeacherName || teacher?.name || ''} ${propTeacherSurname || teacher?.surname || ''
    }`.trim();
  const roomLocation = `${propCorpId || room?.corp_name || ''}-${propRoomName || room?.room_name || ''
    }`.trim();

  const isLocked = lock_id === 1;

  const handleEditClick = () => {
    if (lesson.parent_group) {
      Swal.fire({
        icon: 'warning',
        title: 'Redaktə mümkün deyil',
        text: 'Bu dərs birləşdirilmiş qrupdandır və redaktə edilə bilməz.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    onEdit();
  };

  return (
    <div
      className={`lesson-card ${isMultiple ? 'border-r-2 last:border-r-0 border-dashed border-gray-200' : ''
        } ${lessonTypeClass} p-2 rounded-lg text-xs cursor-pointer transition-colors duration-200 flex-1 relative flex items-center border`}
      onClick={handleEditClick}
      onContextMenu={handleContextMenu}
    >
      <div className="flex-1 min-w-0">
        <div className="lesson-title font-semibold truncate text-gray-800 text-sm">
          {lesson_name?.slice(0, 15) ?? ''}
        </div>

        <div className="lesson-type flex items-cente my-1 gap-1 text-gray-600">
          <span className="text-[10px]">
            {parent_group && ` (${parent_group})`}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="lesson-type flex items-center gap-1 text-gray-600">
              <Clock size={12} />
              <span className="text-[10px]">{lesson_type_name}</span>
            </div>
            <span
              className={`week-type week-type-permanent text-[10px] text-nowrap text-white rounded px-1 py-0.5 ml-2 font-medium ${weekTypeClass}`}
            >
              {week_type_name}
            </span>
          </div>

          {teacherFullName && (
            <div className="lesson-teacher flex items-center gap-1 text-gray-700">
              <User size={12} />
              <span className="text-xs truncate">{teacherFullName}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {roomLocation !== '-' && ( // Ensure roomLocation is not just "-"
              <div className="lesson-room flex items-center gap-1 bg-white text-sm px-1 py-1 rounded border border-gray-200">
                <MapPin size={12} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {roomLocation}
                </span>
              </div>
            )}

            {isLocked && (
              <div className="flex items-center gap-2">
                <Lock size={12} className="text-gray-500" />
                <button
                  className="px-1 py-0.5 text-xs bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddBeside?.();
                  }}
                  title="Dərs əlavə et"
                  disabled={!onAddBeside}
                >
                  <Plus size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;