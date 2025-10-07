import { useEffect, useState } from 'react';
import { get, del } from '../../api/service';
import { FaUserPlus, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa6';
import MergeModal from '../../components/Modals/Merge/MergeModal';
import EditMergeModal from '../../components/Modals/Merge/EditMergeModal';
import useSweetAlert from '../../hooks/useSweetAlert';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import { ClipLoader } from 'react-spinners';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import usePermissions from '../../hooks/usePermissions';

interface Merge {
    merge_id: number;
    lecture_name: string;
    group_names: string;
    lesson_type_name: string;
    semester_id: number;
}

const semesterToText = (semester_id: number) => {
    const year = Math.floor(semester_id / 10);
    const season = semester_id % 10;
    if (season === 1) return `${year} yaz`;
    if (season === 2) return `${year} payız`;
    return semester_id;
};

const MergeGroups = () => {
    const [merges, setMerges] = useState<Merge[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMerge, setSelectedMerge] = useState<Merge | null>(null);
    const { confirmAlert, successAlert, errorAlert } = useSweetAlert();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Sorting states
    const [sortCol, setSortCol] = useState<string>('');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Search states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [searchParams, setSearchParams] = useSearchParams();

    const canEditMerge = usePermissions('edit_group_merge');
    const canDeleteMerge = usePermissions('delete_group_merge');
    const canAddMerge = usePermissions('add_group_merge');


    // Sortable and searchable columns
    const sortableColumns = [
        { key: 'lecture_name', label: 'Dərsin adı' },
        { key: 'group_names', label: 'Qruplar' },
        { key: 'lesson_type_name', label: 'Dərsin tipi' },
        { key: 'semester_id', label: 'Semestr' },
    ];

    // Initialize states from URL params on component mount
    useEffect(() => {
        const pageParam = parseInt(searchParams.get('page') || '1', 10);
        const sortColParam = searchParams.get('sort_col') || '';
        const sortDirParam = searchParams.get('sort_dir') || 'asc';
        const searchTermParam = searchParams.get('search') || '';

        setCurrentPage(pageParam > 0 ? pageParam : 1);
        setSortCol(sortColParam);
        setSortDir(sortDirParam as 'asc' | 'desc');
        setSearchTerm(searchTermParam);
    }, [searchParams]);

    // Update URL parameters
    const updateUrlParams = () => {
        const newParams = new URLSearchParams();
        newParams.set('page', String(currentPage));
        if (sortCol) newParams.set('sort_col', sortCol);
        if (sortDir) newParams.set('sort_dir', sortDir);
        if (debouncedSearchTerm) newParams.set('search', debouncedSearchTerm);
        setSearchParams(newParams);
    };

    // Fetch merges with all parameters
    useEffect(() => {
        let isMounted = true;
        const fetchMerges = async () => {
            // Keep current rows while loading to avoid layout jump
            setLoading(true);
            setError(null);

            try {
                let url = `/api/merges?page=${currentPage}`;
                if (sortCol && sortDir) {
                    url += `&sort_col=${sortCol}&sort_dir=${sortDir}`;
                }
                if (debouncedSearchTerm) {
                    url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
                }

                const res = await get(url);

                if (!isMounted) return;

                if (res.data && res.data.data) {
                    setMerges(res.data.data);
                    setCurrentPage(res.data.current_page || 1);
                    setLastPage(res.data.last_page || 1);
                    setPerPage(res.data.per_page || 10);
                } else {
                    setMerges([]);
                    setError('Serverdən düzgün birləşmə məlumatı gəlmədi.');
                }
                updateUrlParams();
            } catch (err: any) {
                if (!isMounted) return;
                const msg = err?.response?.data?.message || err?.message || 'Birləşmələr yüklənmədi';
                setError(msg);
                setMerges([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMerges();

        return () => {
            isMounted = false;
        };
    }, [currentPage, sortCol, sortDir, debouncedSearchTerm]);

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

    // Handle successful form submission (add/edit)
    const handleSuccess = async () => {
        setLoading(true);
        const res = await get(`/api/merges?page=${currentPage}&sort_col=${sortCol}&sort_dir=${sortDir}&search=${debouncedSearchTerm}`);
        if (res.data && res.data.data) {
            setMerges(res.data.data);
            setCurrentPage(res.data.current_page || 1);
            setLastPage(res.data.last_page || 1);
            setPerPage(res.data.per_page || 10);
        }
        setLoading(false);
    };

    // Handle delete operation
    const handleDelete = async (merge_id: number) => {
        const ok = await confirmAlert('Əminsiniz?', 'Bu birləşməni silmək istəyirsiniz?');
        if (!ok) return;

        setLoading(true);
        try {
            await del(`/api/merges/${merge_id}`);
            successAlert('Uğurlu', 'Birləşmə silindi');
            handleSuccess(); // Refresh the data after deletion
        } catch (err: any) {
            errorAlert('Xəta', 'Silmək mümkün olmadı');
            setLoading(false);
        }
    };

    useEffect(() => {
    // Əgər axtarış sözü dəyişibsə VƏ hazırkı səhifə 1 deyilsə, səhifəni 1-ə sıfırla.
    // Bu, axtarış nəticələrinin hər zaman ilk səhifədən başlamasını təmin edir.
    if (currentPage !== 1) {
        // setCurrentPage(1) çağırılması əsas fetchMerges useEffect-i işə salacaq
        setCurrentPage(1);
    }
    // Qeyd: Əgər currentPage artıq 1-dirsə, setCurrentPage(1) çağırılmır, lakin 
    // əsas fetchMerges useEffect-i debouncedSearchTerm-un dəyişməsi sayəsində yenə də işə düşür.
}, [debouncedSearchTerm]);

    return (
        <div className="">
            {/* Header and Add Button */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Birləşmiş Qruplar</h2>
                {
                    canAddMerge && (
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-sm text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                            onClick={() => setIsMergeModalOpen(true)}
                        >
                            <FaUserPlus className="w-3.5 h-3.5" />
                            Birləşmə əlavə et
                        </button>)
                }
            </div>

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
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto relative min-h-[360px] mt-6">
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
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody className={`${loading ? 'opacity-60' : ''}`}>
                        {error ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-red-500">{error}</td>
                            </tr>
                        ) : merges.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    {debouncedSearchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Birləşmə tapılmadı'}
                                </td>
                            </tr>
                        ) : (
                            merges.map((merge, idx) => (
                                <tr
                                    key={merge.merge_id}
                                    className={`${idx % 2 === 1 ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition`}
                                >
                                    <td className="py-3 px-6 border-b">{(currentPage - 1) * perPage + idx + 1}</td>
                                    <td className="py-3 px-6 border-b">{merge.lecture_name}</td>
                                    <td className="py-3 px-6 border-b">{merge.group_names}</td>
                                    <td className="py-3 px-6 border-b">{merge.lesson_type_name}</td>
                                    <td className="py-3 px-6 border-b">{semesterToText(merge.semester_id)}</td>
                                    <td className="py-3 px-6 border-b text-center">
                                        <div className="flex justify-center gap-2">

                                            {
                                                canEditMerge && (
                                                    <button
                                                        className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                        onClick={() => { setSelectedMerge(merge); setIsEditModalOpen(true); }}
                                                        title="Redaktə et"
                                                    >
                                                        <FaRegEdit className="w-4 h-4" />
                                                    </button>
                                                )
                                            }


                                            {
                                                canDeleteMerge && (
                                                    <button
                                                        className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                        onClick={() => handleDelete(merge.merge_id)}
                                                        title="Sil"
                                                    >
                                                        <AiOutlineDelete className="w-4 h-4" />
                                                    </button>
                                                )
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 pointer-events-none">
                        <ClipLoader size={30} color="#3949AB" />
                    </div>
                )}
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

            {/* Modals */}
            {isMergeModalOpen && <MergeModal isOpen={isMergeModalOpen} onClose={() => setIsMergeModalOpen(false)} onSuccess={handleSuccess} />}
            {isEditModalOpen && selectedMerge && (
                <EditMergeModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setSelectedMerge(null); }}
                    onSuccess={handleSuccess}
                    mergeId={selectedMerge.merge_id}
                />
            )}
        </div>
    );
};

export default MergeGroups;