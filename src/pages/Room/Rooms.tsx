import React, { useEffect, useMemo, useRef, useState } from 'react';
import { get } from '../../api/service';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa6';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useDebounce } from '../../hooks/useDebounce'; // Debounce hook-u
import useSweetAlert from '../../hooks/useSweetAlert';
import usePermissions from '../../hooks/usePermissions';

interface Room {
  id: number;
  name: string;
  room_capacity: number;
  corp_id: number;
  types: string;
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
    '5': 'Yay Semestri',
  };

  const semesterLabel = semesterMap[semester] || 'Bilinməyən';
  return `${year} ${semesterLabel}`;
};

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Sorting states
  const [sortCol, setSortCol] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Global Search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  // 500ms gecikmə ilə debouncer tətbiq olunur
  const debouncedSearchTerm = useDebounce(searchTerm, 450); 

  // Semester state-ləri
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [selectedSemesterYear, setSelectedSemesterYear] = useState<string | null>(null);
  const [appliedSemesterId, setAppliedSemesterId] = useState<number | null>(null);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const semestersLoadedRef = useRef(false);
  const didInitFromUrlRef = useRef(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // SweetAlert və Permissions hook-ları
  const { errorAlert } = useSweetAlert();
  const canViewRoomSchedule = usePermissions('view_room');
  const canViewRoomsArchive = usePermissions('view_rooms_archive');

  // Sortable columns
  const sortableColumns = [
    { key: 'corp_id', label: 'Korpus' },
    { key: 'name', label: 'Otaq adı' },
    { key: 'room_capacity', label: 'Tutum' },
    { key: 'types', label: 'Tip' },
    { key: 'lesson_count', label: 'Dərs sayı' },
  ];

  // URL parametrlərindən state-ləri başlanğıca gətirmək
  useEffect(() => {
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
    if (semesterIdParam && canViewRoomsArchive) {
      const semesterId = parseInt(semesterIdParam, 10);
      if (!isNaN(semesterId)) {
        setSelectedSemesterId(semesterId);
        setAppliedSemesterId(semesterId);
      }
    }
  }, [searchParams]);

  // URL parametrlərini yeniləmək
  const updateUrlParams = () => {
    const newParams = new URLSearchParams();

    newParams.set('page', String(currentPage));
    if (sortCol) newParams.set('sort_col', sortCol);
    if (sortDir) newParams.set('sort_dir', sortDir);

    // Debounced axtarış termini ilə URL yenilənir
    if (debouncedSearchTerm) newParams.set('search', debouncedSearchTerm); 

    if (appliedSemesterId !== null) {
      newParams.set('semester_id', String(appliedSemesterId));
    }

    setSearchParams(newParams);
  };

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
      semestersLoadedRef.current = false;
    } finally {
      setLoadingSemesters(false);
    }
  };

  // Otaq məlumatlarını gətirmək (Fetch logic)
  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      setLoading(true);

      try {
        let url = `/api/rooms?page=${currentPage}`;

        // Semester yalnız permission varsa sorğuya daxil edilir
        if (appliedSemesterId !== null && canViewRoomsArchive) {
          url += `&semester_id=${appliedSemesterId}`;
        }

        if (sortCol && sortDir) {
          url += `&sort_col=${sortCol}&sort_dir=${sortDir}`;
        }

        // Debounced axtarış parametri API sorğusuna əlavə olunur
        if (debouncedSearchTerm) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
        }

        const res = await get(url);

        if (!isMounted) return;

        if (res.data && Array.isArray(res.data.data)) {
          setRooms(res.data.data);
          setCurrentPage(res.data.current_page || 1);
          setLastPage(res.data.last_page || 1);
          setTotal(res.data.total || 0);
          setPerPage(res.data.per_page || 10);

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
          setRooms([]);
          errorAlert('Xəta', 'Serverdən düzgün otaq məlumatı gəlmədi.');
        }

        updateUrlParams(); 
      } catch (err: any) {
        if (!isMounted) return;
        const msg = err?.response?.data?.message || err?.message || 'Otaqlar yüklənmədi';
        errorAlert('Xəta', msg);
        setRooms([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRooms();

    return () => {
      isMounted = false;
    };
  }, [currentPage, sortCol, sortDir, debouncedSearchTerm, appliedSemesterId]); // <-- Əsas trigger debouncedSearchTerm-dur

  const semesterOptions = useMemo(() => {
    if (loadingSemesters) {
      return [<option key="loading" value="">Yüklənir...</option>];
    }

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

  // Handle header click for sorting
  const handleSort = (column: string) => {
    if (sortCol === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(column);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  // Get sort icon
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

  return (
    <div className="space-y-6">
      <Breadcrumb pageName="Otaqlar" />

      {/* Search + Semester Panel */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-grow">
            <label htmlFor="global-search" className="sr-only">Ümumi axtarış</label>
            <input
              id="global-search"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Axtarış başlayanda səhifəni sıxırlamaq
              }}
              placeholder="Axtarış edin..."
              className="px-3 py-2 border border-gray-300 outline-none rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          {canViewRoomsArchive && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Semester:
              </label>
              <select
                value={selectedSemesterId || ''}
                onFocus={() => {
                  void ensureSemestersLoaded();
                }}
                onMouseDown={() => {
                  void ensureSemestersLoaded();
                }}
                onChange={(e) => {
                  const semesterId = Number(e.target.value);
                  setSelectedSemesterId(semesterId);
                  setAppliedSemesterId(semesterId);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {semesterOptions}
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
                {sortableColumns.map((col) => (
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
                {canViewRoomSchedule && (
                  <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">Bax</th>
                )}
              </tr>
          </thead>
          <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={sortableColumns.length + 1 + (canViewRoomSchedule ? 1 : 0)}
                    className="text-center py-16"
                  >
                    <ClipLoader size={30} color="#3949AB" />
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={sortableColumns.length + 1 + (canViewRoomSchedule ? 1 : 0)}
                    className="text-center py-8 text-gray-500"
                  >
                    {debouncedSearchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Otaq tapılmadı'}
                  </td>
                </tr>
            ) : (
              rooms.map((room, idx) => (
                <tr
                  key={room.id}
                  className={`${idx % 2 === 1 ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition`}
                >
                  <td className="py-3 px-6 border-b">
                    {(currentPage - 1) * perPage + idx + 1}
                  </td>
                  <td className="py-3 px-6 border-b">{room.corp_id}</td>
                  <td className="py-3 px-6 border-b">{room.name}</td>
                  <td className="py-3 px-6 border-b">{room.room_capacity}</td>
                  <td className="py-3 px-6 border-b">{room.types}</td>
                  {
                    <td className="py-3 px-6 border-b">{room.lesson_count}</td>
                  }
                  {
                    canViewRoomSchedule && (
                      <td className="py-3 px-6 border-b text-center">
                        <button
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded-lg transition-colors"
                          onClick={() => {
                            const url =
                              selectedSemesterId && canViewRoomsArchive
                                ? `/rooms/${room.id}?semester_id=${selectedSemesterId}`
                                : `/rooms/${room.id}`;
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

export default Rooms;