import React, { useEffect, useState } from 'react';
import { get } from '../../api/service';
import { useNavigate } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners';
import { Faculty } from '../../types';
import useSweetAlert from '../../hooks/useSweetAlert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FaPlus } from 'react-icons/fa6';

const FacultyList: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { errorAlert } = useSweetAlert();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchFaculties = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await get('/api/faculties');
        if (!isMounted) return;
        if (Array.isArray(res.data)) {
          setFaculties(res.data);
        } else {
          setFaculties([]);
          const errMsg = 'Serverdən düzgün data gəlmədi.';
          setError(errMsg);
          errorAlert('Xəta', errMsg);
        }
      } catch (err: any) {
        if (!isMounted) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Fakültələr yüklənmədi';
        setError(msg);
        setFaculties([]);
        errorAlert('Xəta', msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFaculties();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader size={40} color="#6366f1" />
          <span className="text-gray-600 font-medium">Fakültələr yüklənir...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Breadcrumb pageName="Fakültələr" />

     
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Fakültə adı</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Kod</th>
              <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">Bax</th>
            </tr>
          </thead>
          <tbody>
            {faculties.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">Fakültə tapılmadı</td>
              </tr>
            ) : (
              faculties.map((faculty, idx) => (
                <tr key={faculty.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-6 border-b">{idx + 1}</td>
                  <td className="py-3 px-6 border-b">{faculty.name}</td>
                  <td className="py-3 px-6 border-b">{faculty.faculty_code}</td>
                  <td className="py-3 px-6 border-b text-center">
                    <button
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded transition-colors"
                      onClick={() => navigate(`/faculties/${faculty.id}`)}
                      title="Cədvələ bax"
                    >
                      <PiEyeLight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyList;