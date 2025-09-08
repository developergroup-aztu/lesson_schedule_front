import { useEffect, useState } from 'react';
import { get, del } from '../../api/service';
import { FaUserPlus, FaPen, FaTrash } from 'react-icons/fa6';
import MergeModal from '../../components/Modals/Merge/MergeModal';
import EditMergeModal from '../../components/Modals/Merge/EditMergeModal';
import useSweetAlert from '../../hooks/useSweetAlert';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';


const semesterToText = (semester_id: number) => {
    const year = Math.floor(semester_id / 10);
    const season = semester_id % 10;
    if (season === 1) return `${year} yaz`;
    if (season === 2) return `${year} payız`;
    return semester_id;
};

const MergeGroups = () => {
    const [merges, setMerges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMerge, setSelectedMerge] = useState<any | null>(null);
    const { confirmAlert, successAlert, errorAlert } = useSweetAlert();

    useEffect(() => {
        let isMounted = true;
        const fetchMerges = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await get('/api/merges');
                if (!isMounted) return;
                setMerges(Array.isArray(res.data) ? res.data : []);
            } catch (err: any) {
                setError('Birləşmələr yüklənmədi');
                setMerges([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMerges();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Birləşmiş Qruplar</h2>
                <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-sm text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                    onClick={() => setIsMergeModalOpen(true)}
                >
                    <FaUserPlus className="w-3.5 h-3.5" />
                    Birləşmə əlavə et
                </button>
            </div>
            {isEditModalOpen && selectedMerge && (
                <EditMergeModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setSelectedMerge(null); }}
                    onSuccess={() => {
                        setLoading(true);
                        get('/api/merges').then(res => {
                            setMerges(Array.isArray(res.data) ? res.data : []);
                            setLoading(false);
                        });
                    }}
                   mergeId={selectedMerge.merge_id}
                />
            )}
            {isMergeModalOpen && (
                <MergeModal
                    isOpen={isMergeModalOpen}
                    onClose={() => setIsMergeModalOpen(false)}
                    onSuccess={() => {
                        // Modal bağlandıqdan sonra cədvəli yenilə
                        setLoading(true);
                        get('/api/merges').then(res => {
                            setMerges(Array.isArray(res.data) ? res.data : []);
                            setLoading(false);
                        });
                    }}
                />
            )}
            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-indigo-50">
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">#</th>
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Dərsin adı</th>
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Qruplar</th>
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Dərsin tipi</th>
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Semestr</th>
                            <th className="py-4 px-6 border-b text-left font-semibold text-gray-700">Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-indigo-600">
                                    Yüklənir...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-red-500">
                                    {error}
                                </td>
                            </tr>
                        ) : merges.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    Birləşmə tapılmadı
                                </td>
                            </tr>
                        ) : (
                            merges.map((merge, idx) => (
                                <tr
                                    key={merge.merge_id}
                                    className={`${idx % 2 === 1 ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition`}
                                >
                                    <td className="py-3 px-6 border-b">{idx + 1}</td>
                                    <td className="py-3 px-6 border-b">{merge.lecture_name}</td>
                                    <td className="py-3 px-6 border-b">{merge.group_names}</td>
                                    <td className="py-3 px-6 border-b">{merge.lesson_type_name}</td>
                                    <td className="py-3 px-6 border-b">{semesterToText(merge.semester_id)}</td>
                                    <td className="py-3 px-6 border-b text-center">
                                        <div className="flex justify-center gap-2">
                                            {/* Edit düyməsi */}
                                            {/* <button
                                                className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                onClick={() => { setSelectedMerge(merge); setIsEditModalOpen(true); }}
                                                title="Redaktə et"
                                            >
                                                <FaRegEdit className="w-4 h-4" />
                                            </button> */}
                                            {/* Delete düyməsi */}
                                            <button
                                                className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                onClick={async () => {
                                                    const ok = await confirmAlert('Əminsiniz?', 'Bu birləşməni silmək istəyirsiniz?');
                                                    if (!ok) return;
                                                    try {
                                                        await del(`/api/merges/${merge.merge_id}`);
                                                        successAlert('Uğurlu', 'Birləşmə silindi');
                                                        setLoading(true);
                                                        const res = await get('/api/merges');
                                                        setMerges(Array.isArray(res.data) ? res.data : []);
                                                    } catch (err: any) {
                                                        errorAlert('Xəta', 'Silmək mümkün olmadı');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                title="Sil"
                                            >
                                                <AiOutlineDelete className="w-4 h-4" />
                                            </button>
                                        </div>

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

export default MergeGroups;