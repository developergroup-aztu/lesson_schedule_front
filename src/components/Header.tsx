import { Menu, Printer } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useSchedule } from '../context/ScheduleContext';

interface HeaderProps {
  onAddLesson: () => void; // This prop is crucial
}

const Header: React.FC<HeaderProps> = ({ onAddLesson }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [modalOpen, setModalOpen] = useState(false); // This state is indeed not needed here
  // const { scheduleData } = useSchedule(); // Not needed for printing, as you use DOM selector

  const { user } = useAuth();
  const facultyName = user?.faculty_name || useSchedule().scheduleData?.faculty_name || 'Fakültə'; // Fallback to 'Fakültə' if no faculty name is available


  const handlePrint = () => {
    const printContent = document.querySelector('.space-y-12'); // Corrected selector based on ScheduleTable. The outer div with pt-4 space-y-12 includes both morning and afternoon shifts.
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
      <header className="relative z-20 pb-4 px-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="md:text-xl text-md font-extrabold text-blue-800 tracking-tight">
            {facultyName} Fakültəsi Cədvəli
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={onAddLesson} // This calls the prop function
              className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-br from-blue-300 to-blue-500 text-white font-semibold shadow-md hover:from-blue-400 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="text-lg">+</span> Dərs əlavə et
            </button>
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl bg-white/40 border border-blue-200 text-blue-800 font-semibold shadow-md backdrop-blur-sm hover:bg-white/60 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Printer className="w-5 h-5" /> Çap et
            </button>
            <button
              className="sm:hidden flex items-center justify-center p-3 rounded-xl bg-white/40 border border-blue-200 text-blue-800 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute  right-8 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-200 sm:hidden z-30">
            <div className="flex flex-col p-2">
              <button
                onClick={() => {
                  onAddLesson(); // This also calls the prop function
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <span className="text-md">+</span> Dərs əlavə et
              </button>
              <button
                onClick={() => {
                  handlePrint();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <Printer className="w-4 h-4" /> Çap et
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;