import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import AddSemestrModal from '../components/Modals/Smester/AddSemestr';
import EditSemestrModal from '../components/Modals/Smester/EditSemestr';
import DeleteSemestrModal from '../components/Modals/Smester/DeleteSmester';
import ClipLoader from 'react-spinners/ClipLoader';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import usePermissions from '../hooks/usePermissions';

interface Semestr {
  id: number;
  year: string;
  semester_num: string;
}

const Semestrs: React.FC = () => {
  const [semestrs, setSemestrs] = useState<Semestr[]>([]);
  const [selectedSemestr, setSelectedSemestr] = useState<Semestr | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddSemestrModalOpen, setIsAddSemestrModalOpen] = useState(false);
  const [isEditSemestrModalOpen, setIsEditSemestrModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasAddPermission = usePermissions('add_semester');
  const hasEditPermission = usePermissions('edit_semester');
  const hasDeletePermission = usePermissions('delete_semester');
  const hasViewPermission = usePermissions('view_semester');

  useEffect(() => {
    fetchSemestrs();
  }, []);

  const fetchSemestrs = async () => {
    try {
      setLoading(true);
      const response = await get('/api/semesters');
      setSemestrs(response.data);
    } catch (error) {
      console.error('Error fetching semestrs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (semestr: Semestr) => {
    setSelectedSemestr(semestr);
    setIsEditSemestrModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedSemestr) {
      try {
        await del(`/api/semesters/${selectedSemestr.id}`);
        setSemestrs(semestrs.filter((s) => s.id !== selectedSemestr.id));
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting semestr:', error);
      }
    }
  };

  const openDeleteModal = (semestr: Semestr) => {
    setSelectedSemestr(semestr);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedSemestr(null);
    setIsDeleteModalOpen(false);
  };

  const openAddSemestrModal = () => {
    setSelectedSemestr(null);
    setIsAddSemestrModalOpen(true);
  };

  const closeAddSemestrModal = () => {
    setSelectedSemestr(null);
    setIsAddSemestrModalOpen(false);
  };

  const closeEditSemestrModal = () => {
    setSelectedSemestr(null);
    setIsEditSemestrModalOpen(false);
  };

  const handleSaveSemestr = async (year: string, semester_num: string) => {
    try {
      if (selectedSemestr) {
        await put(`/api/semesters/${selectedSemestr.id}`, { year, semester_num });
        setSemestrs(
          semestrs.map((s) =>
            s.id === selectedSemestr.id ? { ...s, year, semester_num } : s,
          ),
        );
      } else {
        const response = await post('/api/semesters', { year, semester_num });
        setSemestrs([...semestrs, response.data]);
      }
      closeAddSemestrModal();
      closeEditSemestrModal();
      fetchSemestrs(); // Yeni semestr eklendikten sonra tabloyu yenile
    } catch (error) {
      console.error('Error saving semestr:', error);
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Semestrlər</h2>
      {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={openAddSemestrModal}
        >
          Yeni Semestr Əlavə Et
        </button>
      )}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center">
            <ClipLoader size={50} color={'#123abc'} loading={loading} />
          </div>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-800">
                <th className="py-2 px-4 border-b">İl</th>
                <th className="py-2 px-4 border-b">Semestr Nömrəsi</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {semestrs.map((semestr) => (
                <tr
                  key={semestr.id}
                  className="hover:bg-gray-100 dark:bg-gray-700 transition-all duration-300 ease-linear"
                >
                  <td className="py-2 px-4 border-b text-center">
                    {semestr.year}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {semestr.semester_num}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {hasEditPermission && (
                      <button
                        className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                        onClick={() => handleEdit(semestr)}
                      >
                        <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        className="bg-red-500 text-white p-2 rounded-lg"
                        onClick={() => openDeleteModal(semestr)}
                      >
                        <AiOutlineDelete className="w-3 md:w-5 h-3 md:h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DeleteSemestrModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <AddSemestrModal
        isOpen={isAddSemestrModalOpen}
        onClose={closeAddSemestrModal}
        onSave={handleSaveSemestr}
      />

      {selectedSemestr && (
        <EditSemestrModal
          isOpen={isEditSemestrModalOpen}
          onClose={closeEditSemestrModal}
          onSave={handleSaveSemestr}
          initialData={{
            id: selectedSemestr.id,
            year: selectedSemestr.year,
            semester_num: selectedSemestr.semester_num,
          }}
        />
      )}
    </div>
  );
};

export default Semestrs;