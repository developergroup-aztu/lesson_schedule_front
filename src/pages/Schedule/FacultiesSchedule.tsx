import React, { useEffect, useState } from 'react';
import { get } from '../../api/service';
import { useNavigate } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners';
import { Faculty } from '../../types'; // Still using Faculty type, though currently any[]
import useSweetAlert from '../../hooks/useSweetAlert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FaPlus } from 'react-icons/fa6';
import { useSearchParams } from 'react-router-dom';

const FacultyList: React.FC = () => {
  const [faculties, setFaculties] = useState<any[]>([]); // Use any[] for now to match API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const { errorAlert } = useSweetAlert();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // On mount, set currentPage from URL if present
  useEffect(() => {
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(pageParam > 0 ? pageParam : 1);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchFaculties = async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await get(`/api/faculties?page=${page}`);
        if (!isMounted) return;
        if (res.data && Array.isArray(res.data.data)) {
          setFaculties(res.data.data);
          setCurrentPage(res.data.current_page || 1);
          setLastPage(res.data.last_page || 1);
          setTotal(res.data.total || 0);
          setPerPage(res.data.per_page || 10);
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
    fetchFaculties(currentPage);
    setSearchParams({ page: String(currentPage) });
    return () => {
      isMounted = false;
    };
  }, [currentPage, setSearchParams]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
      // setSearchParams({ page: String(page) }); // This is already handled in the useEffect dependency
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > lastPage) {
      endPage = lastPage;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push(-1); // -1 signifies ellipsis
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < lastPage) {
      if (endPage < lastPage - 1) pages.push(-1); // -1 signifies ellipsis
      pages.push(lastPage);
    }

    return pages;
  };

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
            <tr className="bg-indigo-50">
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Fakültə adı</th>
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Kod</th>
              <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">Bax</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <ClipLoader size={30} color="#3949AB" />
                  </div>
                </td>
              </tr>
            ) : faculties.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  Fakültə tapılmadı
                </td>
              </tr>
            ) : (
              faculties.map((faculty, idx) => (
                <tr
                  key={faculty.id}
                  className={`${(idx) % 2 === 1 ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    } transition`}
                >
                  <td className="py-3 px-6 border-b">
                    {(currentPage - 1) * perPage + idx + 1}
                  </td>
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

      {/* Pagination Controls with the specified design */}
      {lastPage > 1 && (
        <div className="flex justify-center pt-4">
          <nav className="inline-flex rounded-md gap-2.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-stroke rounded-lg bg-white text-slate-500 hover:bg-indigo-100 hover:border-indigo-100 disabled:opacity-50"
            >
              «
            </button>

            {getPageNumbers().map((page, idx) =>
              page === -1 ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-1 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-lg ${page === currentPage
                      ? 'bg-indigo-600 text-white border-indigo-600 ' // Changed to indigo-600
                      : 'bg-white text-slate-700 hover:bg-indigo-100 hover:border-indigo-100 border-stroke'
                    }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="px-3 py-1 border border-stroke rounded-lg bg-white text-slate-500 hover:bg-indigo-100 hover:border-indigo-100 disabled:opacity-50"
            >
              »
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default FacultyList;