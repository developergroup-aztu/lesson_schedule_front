import { Menu, Printer } from 'lucide-react';
import { useState } from 'react';
import { useSchedule } from '../Context/ScheduleContext';
import HeaderLessonModal from './ScheduleTable/ModalAddLesson';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { scheduleData } = useSchedule();
  const facultyName = scheduleData.faculty.faculty_name;

  const handlePrint = () => {
    const printContent = document.querySelector('.space-y-8');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${facultyName} Fakültəsi - Cədvəl</title>
              <style>
                body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 14px; }
                th { background-color: #f8f9fa; font-weight: 600; }
                h3 { margin: 20px 0 10px; font-size: 16px; font-weight: 600; }
                @media print {
                  body { padding: 0; }
                  table { page-break-inside: auto; }
                  tr { page-break-inside: avoid; page-break-after: auto; }
                  .print-header { text-align: center; margin-bottom: 20px; font-size: 18px; font-weight: 600; }
                }
              </style>
            </head>
            <body>
              <div class="print-header">${facultyName} Fakültəsi</div>
              ${printContent.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <>
      <header className="bg-indigo-50 text-gray-900 py-3 px-4 sm:px-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 rounded-b-lg print:bg-white print:text-black print:shadow-none print:border-b print:border-gray-300">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl font-semibold tracking-wide truncate sm:truncate">
            {facultyName} Fakültəsi
          </h1>
          <button
            className="sm:hidden flex items-center justify-center p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div
          className={`flex flex-col sm:flex-row flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto ${
            isMenuOpen ? 'flex' : 'hidden sm:flex'
          }`}
        >
          <button
            onClick={() => setModalOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors duration-200 flex items-center shrink-0 print:hidden"
          >
            <span className="mr-1">+</span>
            <span>Dərs əlavə et</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm flex items-center transition-colors duration-200 shrink-0 print:hidden"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            <span>Çap et</span>
          </button>
        </div>
      </header>
      <HeaderLessonModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Header;