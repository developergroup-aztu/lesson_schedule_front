import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/service';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { PiEyeLight } from 'react-icons/pi';
import { HiCalendarDays } from 'react-icons/hi2';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../Context/AuthContext';
import usePermissions from '../../hooks/usePermissions';

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

const Archives = () => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { user } = useAuth();
    const hasViewFaculties = usePermissions('view_faculties');
    const hasViewSemesterSchedule = usePermissions('view_semester_schedule');

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                setLoading(true);
                const response = await get('/api/semesters');
                setSemesters(response.data);
                setError(null);
            } catch (err) {
                setError('Məlumatların yüklənməsi zamanı xəta baş verdi');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSemesters();
    }, []);

    const handleViewFaculties = (semesterId: number, yearCode: string) => {
        // Eğer view_faculties permission varsa fakülte listesine git
        if (hasViewFaculties) {
            navigate(`/archives/semester/${semesterId}/faculties`, {
                state: { semesterLabel: getSemesterLabel(yearCode) }
            });
        }
        // Eğer view_semester_schedule varsa kendi fakultesine git (FacultyAdmin)
        else if (hasViewSemesterSchedule && user?.faculty_id) {
            navigate(`/archives/semester/${semesterId}/faculties/${user.faculty_id}`, {
                state: { semesterLabel: getSemesterLabel(yearCode) }
            });
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb pageName="Arxivlər" />

            {/* Desktop Table View */}
            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto hidden lg:block">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-indigo-50">
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">SEMESTR</th>
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">İL KODU</th>
                            <th className="py-4 px-6 border-b text-center font-semibold text-gray-700">ƏMƏLIYYATLAR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="text-center py-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <ClipLoader size={30} color="#3949AB" />
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={3} className="text-center py-8">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg inline-block">
                                        <p className="text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : semesters.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-gray-500">
                                    Heç bir semestr tapılmadı
                                </td>
                            </tr>
                        ) : (
                            semesters.map((semester, index) => (
                                <tr
                                    key={semester.id}
                                    className={`hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}`}
                                >
                                    <td className="py-3 px-6 border-b">
                                        <span className="font-medium text-gray-900">{getSemesterLabel(semester.year)}</span>
                                    </td>
                                    <td className="py-3 px-6 border-b">
                                        <span className="text-gray-700">{semester.year}</span>
                                    </td>
                                    <td className="py-3 px-6 border-b text-center">
                                        <div className="flex justify-center gap-1">
                                            {(hasViewFaculties || hasViewSemesterSchedule) && (
                                                <button
                                                    onClick={() => handleViewFaculties(semester.id, semester.year)}
                                                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded-lg transition-colors"
                                                    title={hasViewFaculties ? "Fakültələrə bax" : "Cədvələ bax"}
                                                >
                                                    <PiEyeLight className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
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
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl shadow border border-red-200">
                        <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
                    </div>
                ) : semesters.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiCalendarDays className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Heç bir semestr tapılmadı
                        </h3>
                        <p className="text-gray-500">
                            Sistemdə hələ heç bir semestr yaradılmayıb
                        </p>
                    </div>
                ) : (
                    semesters.map((semester) => (
                        <div
                            key={semester.id}
                            className="bg-white rounded-2xl shadow border border-gray-100 p-4"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                                        <HiCalendarDays className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                                            {getSemesterLabel(semester.year)}
                                        </h3>
                                        <p className="text-gray-500 text-sm">
                                            Kod: {semester.year}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    {(hasViewFaculties || hasViewSemesterSchedule) && (
                                        <button
                                            onClick={() => handleViewFaculties(semester.id, semester.year)}
                                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-1.5 rounded-lg transition-colors"
                                            title={hasViewFaculties ? "Fakültələrə bax" : "Cədvələ bax"}
                                        >
                                            <PiEyeLight className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Empty State for Desktop (only shown if no semesters and not loading) */}
            {semesters.length === 0 && !loading && !error && (
                <div className="hidden lg:block bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiCalendarDays className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Heç bir semestr tapılmadı
                    </h3>
                    <p className="text-gray-500">
                        Sistemdə hələ heç bir semestr yaradılmayıb
                    </p>
                </div>
            )}
        </div>
    );
};

export default Archives;