import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import TableHeader from './TableHeader';
import ScheduleCell from './ScheduleCell';
import { dayNames } from '../../data/mockData';

interface ScheduleTableProps {
  onAddLesson: (groupId: number, dayId: number, hourId: number, weekTypeId: number) => void;
onOpenContextMenu: (
  e: React.MouseEvent,
  groupId: number,
  dayId: number,
  hourId: number,
  lessonIndex: number,
  weekTypeId: number
) => void;
  onEditLesson: (groupId: number, dayId: number, hourId: number, lessonIndex: number) => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ 
  onAddLesson, 
  onOpenContextMenu,
  onEditLesson
}) => {
  const { scheduleData } = useSchedule();
  const { faculty, hours } = scheduleData;

  // Split hours into shifts
  const morningHours = hours.slice(0, 3);
  const afternoonHours = hours.slice(3, 6);

  const findLessons = (groupId: number, dayId: number, hourId: number) => {
    const group = faculty.groups.find(g => g.group_id === groupId);
    if (!group) return undefined;

    const day = group.days.find(d => d.day_id === dayId);
    if (!day) return undefined;

    const hour = day.hours.find(h => h.hour_id === hourId);
    return hour?.lessons;
  };

  const renderShift = (shiftHours: typeof hours) => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <TableHeader hours={shiftHours} />
        <tbody>
          {faculty.groups.map(group => (
            <tr key={group.group_id} className="border-b border-gray-300">
              <td className="border-r border-gray-300 bg-gray-100 p-2 font-medium text-center">
                {group.group_name}
              </td>

              {Array.from({ length: 5 }).map((_, dayIndex) => {
                const dayId = dayIndex + 1;
                
                return shiftHours.map(hour => {
                  const hourLessons = findLessons(group.group_id, dayId, hour.id);
                  
                  return (
                    <ScheduleCell
                      key={`${group.group_id}-${dayId}-${hour.id}`}
                      groupId={group.group_id}
                      dayId={dayId}
                      hourId={hour.id}
                      lessons={hourLessons}
                      onAddLesson={onAddLesson}
                      onOpenContextMenu={onOpenContextMenu}
                      onEditLesson={onEditLesson}
                    />
                  );
                });
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8 ">
      <div className='pl-2'>
        <h3 className="text-lg font-semibold mb-4">Səhər növbəsi</h3>
        {renderShift(morningHours)}
      </div>
      <div className='pl-2'>
        <h3 className="text-lg font-semibold mb-4">Günorta növbəsi</h3>
        {renderShift(afternoonHours)}
      </div>
    </div>
  );
};

export default ScheduleTable;