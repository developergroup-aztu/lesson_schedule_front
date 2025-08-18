import { Menu, Printer } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useSchedule } from '../context/ScheduleContext';
import { useParams, useLocation } from 'react-router-dom';
import { getFile } from '../api/service';
import useSweetAlert from '../hooks/useSweetAlert';

interface HeaderProps {
  onAddLesson: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddLesson }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();
  const { scheduleData } = useSchedule();
  const params = useParams();
  const location = useLocation();

  // Initialize your sweet alert hook
  const { successAlert, errorAlert } = useSweetAlert();

  const facultyName = user?.faculty_name || scheduleData?.faculty_name || 'Fakültə';

  const getFacultyId = (): string | null => {
    if (params.id) {
      return params.id;
    }

    const pathMatch = location.pathname.match(/\/faculties\/(\d+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    if (user?.faculty_id) {
      return user.faculty_id.toString();
    }

    return null;
  };

  const handleDownloadPdf = async () => {
    const facultyId = getFacultyId();

    if (!facultyId) {
      console.error('Faculty ID not found');
      errorAlert('Xəta!', 'Fakültə ID tapılmadı.'); // Using errorAlert from your hook
      return;
    }

    setIsDownloading(true);

    try {
      console.log(`Requesting PDF for faculty ${facultyId}`);

      const response = await getFile(`/api/schedule/faculty/${facultyId}/print`, {
        headers: {
          'Accept': 'application/pdf'
        }
      });

      console.log('API Response:', response);
      console.log('Response Data:', response.data);

      if (!response.data || (response.data instanceof Blob && response.data.size === 0)) {
        console.error('Received empty or invalid PDF data from API.');
        errorAlert('Xəta!', 'PDF boş və ya səhvdir. API cavabını yoxlayın.'); // Using errorAlert
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${facultyName}_cedvel.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      successAlert('Uğurlu!', 'PDF uğurla endirildi!'); // Using successAlert from your hook

    } catch (err: any) {
      console.error('Download error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Bilinməyən xəta';
      errorAlert('Xəta!', `PDF endirilməsində xəta: ${errorMessage}`); // Using errorAlert
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <header className="relative z-20 pb-4 px-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="md:text-xl text-md font-extrabold text-indigo-800 tracking-tight">
            {facultyName} Fakültəsi Cədvəli
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={onAddLesson}
              className="hidden text-sm sm:flex items-center gap-2 px-2 text-nowrap bg-indigo-600 hover:bg-indigo-700 h-10 rounded-lg text-white transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="md:text-lg text-sm ">+</span> Dərs əlavə et
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="hidden sm:flex items-center gap-2 px-2 h-10 text-sm text-nowrap rounded-lg bg-white/40 border border-indigo-200 text-indigo-800 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-5 h-5" />
              {isDownloading ? 'Yüklənir...' : 'PDF Yüklə'}
            </button>
            <button
              className="sm:hidden flex items-center justify-center p-3 rounded-xl bg-white/40 border border-indigo-200 text-blue-800 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute right-8 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-indigo-200 sm:hidden z-30">
            <div className="flex flex-col p-2">
              <button
                onClick={() => {
                  onAddLesson();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors duration-200"
              >
                <span className="text-md">+</span> Dərs əlavə et
              </button>
              <button
                onClick={() => {
                  handleDownloadPdf();
                  setIsMenuOpen(false);
                }}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                {isDownloading ? 'Yüklənir...' : 'PDF Yüklə'}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;