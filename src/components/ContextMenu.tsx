import React, { useEffect, useRef } from 'react';
import { Edit, Trash, Lock, Unlock } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import Swal from 'sweetalert2';

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

  // Cari dərsi tapmaq üçün funksiya
  const getCurrentLesson = () => {
    if (
      !scheduleData ||
      !scheduleData.groups ||
      groupId === null ||
      dayId === null ||
      hourId === null ||
      lessonIndex === null
    ) {
      return null;
    }
    const group = scheduleData.groups.find(g => g.group_id === groupId);
    if (!group) return null;
    const day = group.days[dayId];
    if (!day) return null;
    const hour = day.hours.find(h => h.hour_id === hourId);
    if (!hour || !hour.lessons[lessonIndex]) return null;
    return hour.lessons[lessonIndex];
  };

  // Dərsin kilidli olub olmadığını yoxla
  const isLessonBlocked = (): boolean => {
    const lesson = getCurrentLesson();
    return lesson ? lesson.lock_id === 1 : false;
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

const handleDelete = async () => {
  const result = await Swal.fire({
    title: 'Əminsiniz?',
    text: 'Bu dərsi silmək istədiyinizə əminsiniz?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Bəli, sil',
    cancelButtonText: 'Ləğv et',
  });
  if (result.isConfirmed) {
    // Burada deleteLesson çağır
    await deleteLesson(groupId, dayId, hourId, lessonIndex);
    onClose();
  }
};

  const handleToggleBlock = () => {
    const lesson = getCurrentLesson();
    if (lesson) {
      toggleBlockStatus(
        lesson.schedule_id,
        lesson.schedule_group_id,
        lesson.lock_id === 1 ? 0 : 1 // yeni status
      );
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