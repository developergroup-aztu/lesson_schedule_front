import React from 'react';
import { dayNames } from '../../data/mockData';
import { Hour } from '../../types';

interface TableHeaderProps {
  hours: Hour[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ hours }) => {
  return (
<thead>
  <tr className="border-b border-gray-300">
    <th className="border-r border-gray-300 bg-gray-100 min-w-[100px] p-2 sticky left-0 z-30 bg-gray-100">
      Qruplar
    </th>
    {dayNames.map((day, dayIndex) => (
      <th
        key={dayIndex}
        colSpan={hours.length}
        className="border-r border-gray-300 bg-gray-100 p-2 text-center sticky top-0 z-20 bg-gray-100"
      >
        {day}
      </th>
    ))}
  </tr>
  <tr className="border-b border-gray-300">
    <th className="border-r border-gray-300 sticky left-0 z-30 bg-gray-100"></th>
    {dayNames.map((_, dayIndex) =>
      hours.map((hour, hourIndex) => (
        <th
          key={`${dayIndex}-${hourIndex}`}
          className="border-r border-gray-300 bg-gray-50 py-1 px-2 text-xs text-center sticky top-[40px] z-10 bg-gray-50"
        >
          {hour.time}
        </th>
      ))
    )}
  </tr>
</thead>
  );
};

export default TableHeader;