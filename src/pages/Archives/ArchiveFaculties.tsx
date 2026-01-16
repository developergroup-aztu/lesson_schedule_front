import React, { useEffect, useState } from 'react';
import { get } from '../../api/service';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';
import { ClipLoader } from 'react-spinners';
import useSweetAlert from '../../hooks/useSweetAlert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import usePermissions from '../../hooks/usePermissions';
import { HiBuildingLibrary } from 'react-icons/hi2';

interface Faculty {
    id: number;
    name: string;
    faculty_code: string;
    created_at: string;
    updated_at: string;
    status: number;
}

const ArchiveFaculties: React.FC = () => {
    const { semesterId } = useParams<{ semesterId: string }>();
    const location = useLocation();
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const { errorAlert } = useSweetAlert();
    const navigate = useNavigate();
    const canViewFacultySchedule = usePermissions('view_faculty');
    const hasViewSemesterSchedule = usePermissions('view_semester_schedule');

    const semesterLabel = (location.state as any)?.semesterLabel || 'Semestr';

    useEffect(() => {
        let isMounted = true;
        const fetchFaculties = async (page = 1) => {
            console.log('Fetching faculties for semesterId:', semesterId, 'page:', page);

            if (!semesterId) {
                console.warn('semesterId is undefined');
                setError('Semestr ID-si tapılmadı');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const url = `/api/semesters/${semesterId}/faculties?page=${page}`;
                console.log('API URL:', url);

                const res = await get(url);
                console.log('API Response:', res);

                if (!isMounted) return;

                // Check if response has pagination structure
                if (res.data?.data && typeof res.data.data === 'object') {
                    // Paginated response
                    const paged = res.data.data;
                    if (Array.isArray(paged.data)) {
                        setFaculties(paged.data);
                        setCurrentPage(paged.current_page || 1);
                        setLastPage(paged.last_page || 1);
                        setPerPage(paged.per_page || 10);
                        console.log('Paginated data loaded:', paged.data);
                    } else {
                        setFaculties([]);
                        const errMsg = 'Serverdən düzgün data gəlmədi.';
                        setError(errMsg);
                        errorAlert('Xəta', errMsg);
                    }
                } else if (Array.isArray(res.data)) {
                    // Direct array response (non-paginated)
                    console.log('Array data loaded:', res.data);
                    setFaculties(res.data);
                    setCurrentPage(1);
                    setLastPage(1);
                    setPerPage(res.data.length);
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
                console.error('Error fetching faculties:', err);
                setError(msg);
                setFaculties([]);
                errorAlert('Xəta', msg);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (semesterId) {
            fetchFaculties(currentPage);
        } else {
            console.warn('No semesterId found in URL params');
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [semesterId, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
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
            if (startPage > 2) pages.push(-1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < lastPage) {
            if (endPage < lastPage - 1) pages.push(-1);
            pages.push(lastPage);
        }

        return pages;
    };

    if (error && !loading) {
        return (
            <div className="space-y-6">
                <Breadcrumb pageName={semesterLabel} />
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200">
                        <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
                        <p className="text-red-500 dark:text-red-300 text-sm text-center mt-2">
                            Semester ID: {semesterId}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb pageName={semesterLabel} />

            {/* Desktop Table View */}
            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto hidden lg:block">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-indigo-50">
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">FAKÜLTƏ ADI</th>
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">KOD</th>
                            {(canViewFacultySchedule || hasViewSemesterSchedule) && (
                                <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">ƏMƏLIYYATLAR</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={(canViewFacultySchedule || hasViewSemesterSchedule) ? 4 : 3} className="text-center py-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <ClipLoader size={30} color="#3949AB" />
                                    </div>
                                </td>
                            </tr>
                        ) : faculties.length === 0 ? (
                            <tr>
                                <td colSpan={(canViewFacultySchedule || hasViewSemesterSchedule) ? 4 : 3} className="text-center py-8 text-gray-500">
                                    Fakültə tapılmadı
                                </td>
                            </tr>
                        ) : (
                            faculties.map((faculty, idx) => (
                                <tr
                                    key={faculty.id}
                                    className={`${idx % 2 === 1 ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition`}
                                >
                                    <td className="py-3 px-6 border-b">
                                        {(currentPage - 1) * perPage + idx + 1}
                                    </td>
                                    <td className="py-3 px-6 border-b font-medium text-gray-900">{faculty.name}</td>
                                    <td className="py-3 px-6 border-b text-gray-700">{faculty.faculty_code}</td>
                                    {(canViewFacultySchedule || hasViewSemesterSchedule) && (
                                        <td className="py-3 px-6 border-b text-center">
                                            <button
                                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded-lg transition-colors"
                                                onClick={() => navigate(`/archives/semester/${semesterId}/faculties/${faculty.id}`)}
                                                title="Cədvələ bax"
                                            >
                                                <PiEyeLight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="flex flex-col items-center gap-4">
                            <ClipLoader size={30} color="#3949AB" />
                        </div>
                    </div>
                ) : faculties.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiBuildingLibrary className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Fakültə tapılmadı
                        </h3>
                        <p className="text-gray-500">
                            Bu semestrdə heç bir fakültə təyin edilməmişdir
                        </p>
                    </div>
                ) : (
                    faculties.map((faculty) => (
                        <div
                            key={faculty.id}
                            className="bg-white rounded-2xl shadow border border-gray-100 p-4"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                                        <HiBuildingLibrary className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                                            {faculty.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm">
                                            Kod: {faculty.faculty_code}
                                        </p>
                                    </div>
                                </div>
                                {(canViewFacultySchedule || hasViewSemesterSchedule) && (
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button
                                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded-lg transition-colors"
                                            onClick={() => navigate(`/archives/semester/${semesterId}/faculties/${faculty.id}`)}
                                            title="Cədvələ bax"
                                        >
                                            <PiEyeLight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Empty State for Desktop */}
            {faculties.length === 0 && !loading && !error && (
                <div className="hidden lg:block bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiBuildingLibrary className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Fakültə tapılmadı
                    </h3>
                    <p className="text-gray-500">
                        Bu semestrdə heç bir fakültə təyin edilməmişdir
                    </p>
                </div>
            )}

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
                                        ? 'bg-indigo-600 text-white border-indigo-600'
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

export default ArchiveFaculties;