import React from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Printer } from 'lucide-react';

interface HeaderProps {
  onAddLesson: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddLesson }) => {
  const { scheduleData } = useSchedule();
  const facultyName = scheduleData.faculty.faculty_name;

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-indigo-50 text-gray-900 py-3 px-6 shadow-sm flex items-center justify-between rounded-b-lg print:bg-white print:text-black print:shadow-none print:border-b print:border-gray-300">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold tracking-wide">{facultyName} Fakültəsi</h1>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onAddLesson}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-1.5 rounded-full text-sm transition-colors duration-200 flex items-center print:hidden"
        >
          <span className="mr-1">+</span>
          <span>Dərs əlavə et</span>
        </button>
        
        <button
          onClick={handlePrint}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-1.5 rounded-full text-sm flex items-center transition-colors duration-200 print:hidden"
        >
          <Printer className="w-4 h-4 mr-1" />
          <span>Çap et</span>
        </button>
      </div>
    </header>
  );
};

export default Header;