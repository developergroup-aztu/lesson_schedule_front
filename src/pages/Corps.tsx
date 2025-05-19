import React, { useEffect, useState } from 'react';
import { get, post, put, del } from '../api/service';
import AddCorpsModal from '../components/Modals/Corps/AddCrops';
import EditCorpsModal from '../components/Modals/Corps/EditCrops';
import DeleteCorpsModal from '../components/Modals/Corps/DeleteCorps';
import ClipLoader from 'react-spinners/ClipLoader';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import usePermissions from '../hooks/usePermissions';
import Swal from 'sweetalert2';

interface Corps {
  id: number;
  name: string;
}

const Corps: React.FC = () => {
  const [corps, setCorps] = useState<Corps[]>([]);
  const [selectedCorps, setSelectedCorps] = useState<Corps | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddCorpsModalOpen, setIsAddCorpsModalOpen] = useState(false);
  const [isEditCorpsModalOpen, setIsEditCorpsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasAddPermission = usePermissions('add_corp');
  const hasEditPermission = usePermissions('edit_corp');
  const hasDeletePermission = usePermissions('delete_corp');
  const hasViewPermission = usePermissions('view_corp');

  useEffect(() => {
    fetchCorps();
  }, []);

  const fetchCorps = async () => {
    try {
      setLoading(true);
      const response = await get('/api/corps');
      setCorps(response.data);
    } catch (error) {
      console.error('Error fetching corps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (corps: Corps) => {
    setSelectedCorps(corps);
    setIsEditCorpsModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedCorps) {
      try {
        await del(`/api/corps/${selectedCorps.id}`);
        setCorps(corps.filter((c) => c.id !== selectedCorps.id));
        closeDeleteModal();
        Swal.fire({
          title: 'Silindi!',
          text: 'Korpus uğurla silindi.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } catch (error) {
        console.error('Error deleting corps:', error);
        Swal.fire({
          title: 'Xəta!',
          text:
            error.response?.data?.message ||
            'Fakültəni silərkən xəta baş verdi.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  const openDeleteModal = (corps: Corps) => {
    setSelectedCorps(corps);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedCorps(null);
    setIsDeleteModalOpen(false);
  };

  const openAddCorpsModal = () => {
    setSelectedCorps(null);
    setIsAddCorpsModalOpen(true);
  };

  const closeAddCorpsModal = () => {
    setSelectedCorps(null);
    setIsAddCorpsModalOpen(false);
  };

  const closeEditCorpsModal = () => {
    setSelectedCorps(null);
    setIsEditCorpsModalOpen(false);
  };

  const handleSaveCorps = async (name: string) => {
    try {
      if (selectedCorps) {
        await put(`/api/corps/${selectedCorps.id}`, { name });
        setCorps(
          corps.map((c) => (c.id === selectedCorps.id ? { ...c, name } : c)),
        );
      } else {
        const response = await post('/api/corps', { name });
        setCorps([...corps, response.data]);
      }
      closeAddCorpsModal();
      closeEditCorpsModal();
      fetchCorps(); // Yeni korpus eklendikten sonra tabloyu yenile
    } catch (error) {
      console.error('Error saving corps:', error);
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Korpuslar</h2>
      {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={openAddCorpsModal}
        >
          Yeni Korpus Əlavə Et
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
                <th className="py-2 px-4 border-b">Ad</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {corps.map((corps) => (
                <tr
                  key={corps.id}
                  className="hover:bg-gray-100 dark:bg-gray-700"
                >
                  <td className="py-2 px-4 border-b text-center">
                    {corps.name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {hasEditPermission && (
                      <button
                        className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                        onClick={() => handleEdit(corps)}
                      >
                        <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        className="bg-red-500 text-white p-2 rounded-lg"
                        onClick={() => openDeleteModal(corps)}
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

      <DeleteCorpsModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <AddCorpsModal
        isOpen={isAddCorpsModalOpen}
        onClose={closeAddCorpsModal}
        onSave={handleSaveCorps}
      />

      {selectedCorps && (
        <EditCorpsModal
          isOpen={isEditCorpsModalOpen}
          onClose={closeEditCorpsModal}
          onSave={handleSaveCorps}
          initialData={{
            id: selectedCorps.id,
            name: selectedCorps.name,
          }}
        />
      )}
    </div>
  );
};

export default Corps;
