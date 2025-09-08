import React from 'react';
import { Search } from 'lucide-react';

interface FilterProps {
  selectedGroups: string[];
  selectedHours: string[];
  onGroupChange: (groups: string[]) => void;
  onHourChange: (hours: string[]) => void;
  groups: any[];
  hours: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ScheduleFilter = ({
  selectedGroups,
  selectedHours,
  onGroupChange,
  onHourChange,
  groups,
  hours,
  searchQuery,
  onSearchChange,
}: FilterProps) => {
  return (
    <div className="mb-6 p-4 bg-white/80 backdrop-blur-xl rounded-xl border border-white/70 shadow-lg">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Qrup axtar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Group Multi-select */}
        <div className="flex-1">
          <select
            multiple
            className="w-full p-2 border border-gray-200 rounded-lg h-24"
            value={selectedGroups}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onGroupChange(selected);
            }}
          >
            {groups.map(group => (
              <option key={group.group_id} value={group.group_id}>
                {group.group_name}
              </option>
            ))}
          </select>
        </div>

        {/* Hours Multi-select */}
        <div className="flex-1">
          <select
            multiple
            className="w-full p-2 border border-gray-200 rounded-lg h-24"
            value={selectedHours}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onHourChange(selected);
            }}
          >
            {hours.map(hour => (
              <option key={hour.id} value={hour.id}>
                {hour.hour_value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilter;