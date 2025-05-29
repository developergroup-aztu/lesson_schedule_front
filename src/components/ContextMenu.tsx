import React, { useEffect, useRef } from 'react';
import { Edit, Trash, Lock, Unlock } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  groupId: number | null;
  dayId: number | null;
  hourId: number | null;
  lessonIndex: number | null;
  weekTypeId: number | null;
  onEdit: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  groupId,
  dayId,
  hourId,
  lessonIndex,
  weekTypeId,
  onEdit,
}) => {
  const { deleteLesson, toggleBlockStatus, scheduleData } = useSchedule();
  const menuRef = useRef<HTMLDivElement>(null);

  // Find the current lesson to determine if it's blocked
  const isLessonBlocked = (): boolean => {
    if (groupId === null || dayId === null || hourId === null || lessonIndex === null) {
      return false;
    }

    const group = scheduleData.faculty.groups.find(g => g.group_id === groupId);
    if (!group) return false;

    const day = group.days.find(d => d.day_id === dayId);
    if (!day) return false;

    const hour = day.hours.find(h => h.hour_id === hourId);
    if (!hour || !hour.lessons[lessonIndex]) return false;

    return hour.lessons[lessonIndex].blocked;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const handleDelete = () => {
    if (groupId !== null && dayId !== null && hourId !== null && lessonIndex !== null) {
      deleteLesson(groupId, dayId, hourId, lessonIndex);
    }
    onClose();
  };

  const handleToggleBlock = () => {
    if (groupId !== null && dayId !== null && hourId !== null && lessonIndex !== null) {
      toggleBlockStatus(groupId, dayId, hourId, lessonIndex);
    }
    onClose();
  };

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      className="bg-[#ffffff2e] backdrop-blur-md rounded-md shadow-lg border border-gray-200 py-1 w-48"
      style={menuStyle}
    >
      <button
        onClick={handleEdit}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <Edit size={16} className="mr-2" />
        <span>Redaktə et</span>
      </button>
      <button
        onClick={handleDelete}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
      >
        <Trash size={16} className="mr-2" />
        <span>Sil</span>
      </button>
      <button
        onClick={handleToggleBlock}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        {isLessonBlocked() ? (
          <>
            <Unlock size={16} className="mr-2" />
            <span>Kilidi aç</span>
          </>
        ) : (
          <>
            <Lock size={16} className="mr-2" />
            <span>Kilidlə</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ContextMenu;