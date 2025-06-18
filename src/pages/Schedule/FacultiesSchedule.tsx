import React, { useEffect, useState } from 'react';
import { get } from '../../api/service';
import { useNavigate } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import { Faculty } from '../../types';
import useSweetAlert from '../../hooks/useSweetAlert';


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
      <div className="flex justify-center items-center h-[80vh] bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-2xl border border-blue-100">
          <ClipLoader size={60} color="#6366f1" speedMultiplier={1.2} />
          <span className="text-blue-700 font-semibold text-lg animate-pulse">
            Fakültələr yüklənir...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-lg text-center font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="relative rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-95" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-300 opacity-30 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-2xl" />
        <div className="relative p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Fakültələr</h1>
              <p className="text-blue-100">
                Cəmi {faculties.length} fakültə tapıldı
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
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
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition-colors duration-200"
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