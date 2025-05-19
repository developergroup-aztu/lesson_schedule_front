import React, { useEffect, useState } from 'react';
import { getDays } from '../../api/service';

interface Day {
  id: number;
  day_name: string;
}

interface Hour {
  id: number;
  time_range: string;
}

interface ScheduleTableProps {
  selectedHour: string;
  selectedDay: string;
  hours: Hour[];
  days: Day[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  selectedHour,
  selectedDay,
  hours,
  days,
}) => {
  const [error, setError] = useState<string | null>(null);

  const filteredDays = days.filter(
    (day) => selectedDay === '' || day.day_name === selectedDay,
  );

  const filteredHours = hours.filter(
    (hour) => selectedHour === '' || hour.time_range === selectedHour,
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">Saat</th>
            {filteredDays.map((day) => (
              <th key={day.id} className="py-2 px-4 border-b">
                {day.day_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredHours.map((hour) => (
            <tr key={hour.id}>
              <td className="py-2 px-4 border-b">{hour.time_range}</td>
              {filteredDays.map((day) => (
                <td key={day.id} className="py-2 px-4 border-b">
                  {/* Ders bilgileri burada gösterilecek */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ScheduleTable;
