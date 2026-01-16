import React, { useEffect, useMemo, useRef, useState } from 'react';
import { get } from '../../api/service';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa6';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useDebounce } from '../../hooks/useDebounce'; // Assuming you have this hook
import usePermissions from '../../hooks/usePermissions';

interface Teacher {
  id: number;
  name: string;
  surname: string;
  fin_code: string;
  lesson_count: number;
}

interface Semester {
  id: number;
  year: string;
}

const getSemesterLabel = (yearCode: string): string => {
  if (!yearCode || yearCode.length < 5) return yearCode;

  const year = yearCode.slice(0, 4);
  const semester = yearCode.slice(4, 5);

  const semesterMap: { [key: string]: string } = {
    '1': 'Yaz Semestri',
    '2': 'Payız Semestri',
    '5': 'Yay Semestri'
  };

  const semesterLabel = semesterMap[semester] || 'Bilinməyən';
  return `${year} ${semesterLabel}`;
};

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Sorting states
  const [sortCol, setSortCol] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Search term for global search input (only this one needed)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Semester states
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  // UI-də seçilən semester (default backend-dən gələn ola bilər),
  // sorğuya tətbiq olunan semester isə yalnız user action ilə set olunur.
  const [appliedSemesterId, setAppliedSemesterId] = useState<number | null>(null);
  const [selectedSemesterYear, setSelectedSemesterYear] = useState<string | null>(null);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const semestersLoadedRef = useRef(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const didInitFromUrlRef = useRef(false);

  const canViewTeacherSchedule = usePermissions('view_teacher');
  const canViewTeachersArchive = usePermissions('view_teachers_archive');

  // Sortable columns (these are now also the searchable columns for global search)
  const sortableColumns = [
    { key: 'name', label: 'Adı' },
    { key: 'surname', label: 'Soyadı' },
    { key: 'fin_code', label: 'FIN kod' },
    { key: 'lesson_count', label: 'Dərs sayı' },
  ];

  useEffect(() => {
    // URL parametrlərini yalnız ilk mount-da oxuyuruq
    if (didInitFromUrlRef.current) return;
    didInitFromUrlRef.current = true;

    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const sortColParam = searchParams.get('sort_col') || '';
    const sortDirParam = searchParams.get('sort_dir') || 'asc';
    const searchTermParam = searchParams.get('search') || '';
    const semesterIdParam = searchParams.get('semester_id');

    setCurrentPage(pageParam > 0 ? pageParam : 1);
    setSortCol(sortColParam);
    setSortDir(sortDirParam as 'asc' | 'desc');
    setSearchTerm(searchTermParam);

    // Əgər URL-də semester_id varsa VƏ permission varsa, onu user seçimi kimi tətbiq edirik
    if (semesterIdParam && canViewTeachersArchive) {
      const semesterId = parseInt(semesterIdParam, 10);
      if (!isNaN(semesterId)) {
        setSelectedSemesterId(semesterId);
        setAppliedSemesterId(semesterId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureSemestersLoaded = async () => {
    if (semestersLoadedRef.current) return;
    semestersLoadedRef.current = true;
    setLoadingSemesters(true);
    try {
      const res = await get('/api/semesters');
      if (res.data && Array.isArray(res.data)) {
        const sortedSemesters = [...res.data].sort((a, b) => b.year.localeCompare(a.year));
        setSemesters(sortedSemesters);
      }
    } catch (err) {
      console.error('Semesterlər yüklənə bilmədi:', err);
      // allow retry
      semestersLoadedRef.current = false;
    } finally {
      setLoadingSemesters(false);
    }
  };

  // Update URL parameters
  const updateUrlParams = () => {
    const newParams = new URLSearchParams();

    newParams.set('page', String(currentPage));
    if (sortCol) newParams.set('sort_col', sortCol);
    if (sortDir) newParams.set('sort_dir', sortDir);

    if (debouncedSearchTerm) newParams.set('search', debouncedSearchTerm);
    
    if (appliedSemesterId !== null) {
      newParams.set('semester_id', String(appliedSemesterId));
    }

    setSearchParams(newParams);
  };

  // Fetch teachers with all parameters (pagination, sorting, global searching, semester)
  useEffect(() => {
    let isMounted = true;
    const fetchTeachers = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `/api/teachers?page=${currentPage}`;

        // Semester yalnız user seçəndə VƏ permission varsa sorğuya daxil edilir
        if (appliedSemesterId !== null && canViewTeachersArchive) {
          url += `&semester_id=${appliedSemesterId}`;
        }

        // Add sorting parameters
        if (sortCol && sortDir) {
          url += `&sort_col=${sortCol}&sort_dir=${sortDir}`;
        }

        // Add global search parameter
        if (debouncedSearchTerm) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
        }

        const res = await get(url);

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data.data)) {
          setTeachers(res.data.data);
          setCurrentPage(res.data.current_page || 1);
          setLastPage(res.data.last_page || 1);
          setTotal(res.data.total || 0);
          setPerPage(res.data.per_page || 10);

          // Hər cavabda backend-dən gələn semester məlumatını select üçün göstər
          const serverSemesterId =
            typeof res.data.semester_id === 'number' ? res.data.semester_id : null;
          const serverSemesterYear =
            typeof res.data.semester_year === 'string' ? res.data.semester_year : null;

          if (serverSemesterId !== null) {
            setSelectedSemesterId(serverSemesterId);
          }
          if (serverSemesterYear) {
            setSelectedSemesterYear(serverSemesterYear);
          }
        } else {
          setTeachers([]);
          setError('Serverdən düzgün müəllim məlumatı gəlmədi.');
        }

        updateUrlParams(); // Update URL after fetching data
      } catch (err: any) {
        if (!isMounted) return;
        const msg =
          err?.response?.data?.message || err?.message || 'Müəllimlər yüklənmədi';
        setError(msg);
        setTeachers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTeachers();

    return () => {
      isMounted = false;
    };
  }, [currentPage, sortCol, sortDir, debouncedSearchTerm, appliedSemesterId]); // Dependencies for re-fetching data

  const semesterSelectOptions = useMemo(() => {
    // Əgər semestrlər yüklənirsə, loading göstər
    if (loadingSemesters) {
      return [<option key="loading" value="">Yüklənir...</option>];
    }

    // Əgər semestrlər hələ yüklənməyibsə, ən azından current defaultu göstərək
    if (semesters.length === 0) {
      if (selectedSemesterId !== null && selectedSemesterYear) {
        return [
          <option key={selectedSemesterId} value={selectedSemesterId}>
            {getSemesterLabel(selectedSemesterYear)}
          </option>,
        ];
      }
      return [<option key="loading" value="">Seçin</option>];
    }

    return semesters.map((semester) => (
      <option key={semester.id} value={semester.id}>
        {getSemesterLabel(semester.year)}
      </option>
    ));
  }, [semesters, selectedSemesterId, selectedSemesterYear, loadingSemesters]);

  // Axtarış başladığında səhifəni 1-ə sıfırla
useEffect(() => {
  // Axtarış sözü boş deyilsə VƏ hazırkı səhifə 1 deyilsə (və ya axtarış sözü dəyişibsə), 1-ə sıfırla
  // Bu, axtarış nəticəsinin hər zaman 1-ci səhifədən göstərilməsini təmin edir.
  if (debouncedSearchTerm) {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  } else if (!debouncedSearchTerm && currentPage !== 1 && searchParams.get('search')) {
      // Əgər axtarış boşalıbsa, amma URL-də hələ də axtarış parametri varsa və biz 1-ci səhifədə deyiliksə, 1-ə sıfırlayırıq.
      setCurrentPage(1);
  }
}, [debouncedSearchTerm]); // Yalnız axtarış sözü dəyişdikdə işə düşür

  // Handle header click for sorting
  const handleSort = (column: string) => {
    if (sortCol === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(column);
      setSortDir('asc');
    }
    setCurrentPage(1); // Reset to the first page when sorting changes
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  // Get sort icon for table headers
  const getSortIcon = (column: string) => {
    if (sortCol !== column) {
      return <FaSort className="w-3 h-3 text-gray-400" />;
    }
    return sortDir === 'asc' ? (
      <FaSortUp className="w-3 h-3 text-indigo-500" />
    ) : (
      <FaSortDown className="w-3 h-3 text-indigo-500" />
    );
  };

  // Get page numbers for pagination
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

  // Error message display
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
      {/* Header */}
      <Breadcrumb pageName="Müəllimlər" />

      {/* Search Panel */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-grow">
            <label htmlFor="global-search" className="sr-only">Ümumi axtarış</label>
            <input
              id="global-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Axtarış edin..."
              className="px-3 py-2 border border-gray-300 outline-none rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          {canViewTeachersArchive && (
            <div className="flex items-center gap-2">
              <label htmlFor="semester-select" className="text-sm font-medium text-gray-700">
                Semester:
              </label>
              <select
                id="semester-select"
                value={selectedSemesterId || ''}
                onFocus={() => {
                  // yalnız user interaction olanda yüklə
                  void ensureSemestersLoaded();
                }}
                onMouseDown={() => {
                  // bəzi brauzerlərdə focus gec düşür, ona görə klikdə də çağırırıq
                  void ensureSemestersLoaded();
                }}
                onChange={(e) => {
                  const semesterId = e.target.value ? Number(e.target.value) : null;
                  setSelectedSemesterId(semesterId);
                  setAppliedSemesterId(semesterId);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {semesterSelectOptions}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto relative">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-indigo-50">
              <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
              {sortableColumns.map(col => (
                <th
                  key={col.key}
                  className="py-4 px-6 border-b text-left font-semibold text-gray-700 cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {getSortIcon(col.key)}
                  </div>
                </th>
              ))}
              {
                canViewTeacherSchedule && <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">Bax</th>
              }
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <ClipLoader size={30} color="#3949AB" />
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {debouncedSearchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Müəllim tapılmadı'}
                </td>
              </tr>
            ) : (
              teachers.map((teacher, idx) => (
                <tr
                  key={teacher.id}
                  className={`${idx % 2 === 1 ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition`}
                >
                  <td className="py-3 px-6 border-b">{(currentPage - 1) * perPage + idx + 1}</td>
                  <td className="py-3 px-6 border-b">{teacher.name}</td>
                  <td className="py-3 px-6 border-b">{teacher.surname}</td>
                  <td className="py-3 px-6 border-b">{teacher.fin_code}</td>
                  <td className="py-3 px-6 border-b">{teacher.lesson_count}</td>
                 {
                  canViewTeacherSchedule && (
                     <td className="py-3 px-6 border-b text-center">
                    <button
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded-lg transition-colors"
                      onClick={() => {
                        const url =
                          selectedSemesterId && canViewTeachersArchive
                            ? `/teachers/${teacher.id}?semester_id=${selectedSemesterId}`
                            : `/teachers/${teacher.id}`;
                        navigate(url);
                      }}
                      title="Cədvələ bax"
                    >
                      <PiEyeLight className="w-5 h-5" />
                    </button>
                  </td>
                  )
                 }
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
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
                      ? 'bg-indigo-600 text-white border-indigo-600 '
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

export default Teachers;