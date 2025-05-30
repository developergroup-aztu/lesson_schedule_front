import React, { useEffect, useState } from 'react';
import { get } from '../../api/service';
import { useNavigate } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';

interface Department {
  faculty_code: string;
  name: string;
}

interface Faculty {
  id: number;
  name: string;
  faculty_code: string;
  departments: Department[];
}

const FacultyList: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const res = await get('/api/faculties');
        setFaculties(res.data || []);
      } catch (err: any) {
        setError('Fakültələr yüklənmədi');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">Fakültələr</h1>
      <div className="bg-white rounded-lg shadow border">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#e3e3e3]">
              <th className="py-2 px-4 border-b text-left">#</th>
              <th className="py-2 px-4 border-b text-left">Fakültə adı</th>
              <th className="py-2 px-4 border-b text-left">Kod</th>
              <th className="py-2 px-4 border-b text-center">Bax</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">Yüklənir...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-red-500">{error}</td>
              </tr>
            ) : faculties.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">Fakültə tapılmadı</td>
              </tr>
            ) : (
              faculties.map((faculty, idx) => (
                <tr key={faculty.id} className="hover:bg-gray-50 transition">
                  <td className="py-2 px-4 border-b">{idx + 1}</td>
                  <td className="py-2 px-4 border-b">{faculty.name}</td>
                  <td className="py-2 px-4 border-b">{faculty.faculty_code}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition-colors duration-200"
                      onClick={() => navigate(`/faculty/${faculty.id}/schedule`)}
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