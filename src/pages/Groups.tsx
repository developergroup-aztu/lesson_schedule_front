import React, { useEffect, useState } from 'react';
import { get, del } from '../api/service';
import AddGroupModal from '../components/Modals/Group/AddGroup';
import EditGroupModal from '../components/Modals/Group/EditGroup';
import DeleteGroupModal from '../components/Modals/Group/DeleteGroup';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaRegEdit } from 'react-icons/fa';
import { PiEyeLight } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../hooks/usePermissions';
import Swal from 'sweetalert2';
import ClipLoader from 'react-spinners/ClipLoader';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

interface Group {
  id: number;
  name: string;
  student_amount: number;
  group_type: number;
  faculty_id: number;
  course_id: number;
  speciality_id: number;
  created_at: string | null;
  updated_at: string | null;
  status: number;
  group_level: number;
  faculty: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    status: number;
  };
  speciality: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    faculty_id: number;
    status: number;
  };
  course: {
    id: number;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    status: number;
  };
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const hasAddPermission = usePermissions('add_group');
  const hasEditPermission = usePermissions('edit_group');
  const hasDeletePermission = usePermissions('delete_group');
  const hasViewPermission = usePermissions('view_group');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleEdit = (group: Group) => {
  //   setSelectedGroup(group);
  //   setIsEditGroupModalOpen(true);
  // };

  // const handleDelete = async () => {
  //   if (selectedGroup) {
  //     try {
  //       await del(`/api/groups/${selectedGroup.id}`);
  //       setGroups(groups.filter((group) => group.id !== selectedGroup.id));
  //       closeDeleteModal();
  //       Swal.fire({
  //         title: 'Silindi!',
  //         text: 'Qrup uğurla silindi.',
  //         icon: 'success',
  //         confirmButtonText: 'OK'
  //       });
  //     } catch (error) {
  //       console.error('Error deleting group:', error);
  //       Swal.fire({
  //         title: 'Xəta!',
  //         text: error.response?.data?.message || 'Fakültəni silərkən xəta baş verdi.',
  //         icon: 'error',
  //         confirmButtonText: 'OK'
  //       });
  //     }
  //   }
  // };

  // const openDeleteModal = (group: Group) => {
  //   setSelectedGroup(group);
  //   setIsDeleteModalOpen(true);
  // };

  // const closeDeleteModal = () => {
  //   setSelectedGroup(null);
  //   setIsDeleteModalOpen(false);
  // };

  // const openAddGroupModal = () => {
  //   setSelectedGroup(null);
  //   setIsAddGroupModalOpen(true);
  // };

  // const closeAddGroupModal = () => {
  //   setSelectedGroup(null);
  //   setIsAddGroupModalOpen(false);
  // };

  // const closeEditGroupModal = () => {
  //   setSelectedGroup(null);
  //   setIsEditGroupModalOpen(false);
  // };

  // const handleSaveGroup = () => {
  //   fetchGroups(); // Yeni grup eklendikten veya güncellendikten sonra tabloyu yenile
  // };

  const getGroupTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return 'Əyani';
      case 2:
        return 'Qiyabi';
      default:
        return '';
    }
  };

  const getGroupLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Bakalavr';
      case 2:
        return 'Magistr';
      default:
        return '';
    }
  };

    if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} color={'#123abc'} loading={loading} />
      </div>
    );
  }

  return (
    <div className="">
            <Breadcrumb pageName="Qruplar" />

      {/* {hasAddPermission && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={openAddGroupModal}
        >
          Yeni Qrup Əlavə Et
        </button>
      )} */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200  dark:bg-gray-800">
                <th className="py-2 px-4 border-b">Ad</th>
                <th className="py-2 px-4 border-b">Tələbə Sayı</th>
                <th className="py-2 px-4 border-b">Qrup Tipi</th>
                <th className="py-2 px-4 border-b">Qrup Səviyyəsi</th>
                <th className="py-2 px-4 border-b">Fakültə</th>
                <th className="py-2 px-4 border-b">İxtisas</th>
                <th className="py-2 px-4 border-b">Kurs</th>
                {/* <th className="py-2 px-4 border-b">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr
                  key={group.id}
                  className="hover:bg-gray-100  dark:bg-gray-700"
                >
                  <td className="py-2 px-4 border-b text-center">{group.name}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {group.student_amount}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {getGroupTypeLabel(group.group_type)}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {getGroupLevelLabel(group.group_level)}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {group.faculty.name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    { group.speciality ? group.speciality.name : 'Yoxdur' }
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {group.course.name}
                  </td>
                  {/* <td className="py-2 px-4 border-b text-center">
                    <div className="flex flex-col items-center md:flex-row md:justify-center gap-2">
                      {hasViewPermission && (
                        <button
                          className="bg-[#d29a00] text-white p-2 rounded-lg mr-2"
                          onClick={() => navigate(`/groups/${group.id}`)}
                        >
                          <PiEyeLight className="w-3 md:w-5 h-3 md:h-5" />
                        </button>
                      )}
                      {hasEditPermission && (
                        <button
                          className="bg-blue-500 text-white p-2 rounded-lg mr-2"
                          onClick={() => handleEdit(group)}
                        >
                          <FaRegEdit className="w-3 md:w-5 h-3 md:h-5" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          className="bg-red-500 text-white p-2 rounded-lg"
                          onClick={() => openDeleteModal(group)}
                        >
                          <AiOutlineDelete className="w-3 md:w-5 h-3 md:h-5" />
                        </button>
                      )}
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      {/* <DeleteGroupModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={closeAddGroupModal}
        onSave={handleSaveGroup}
      />

      {selectedGroup && (
        <EditGroupModal
          isOpen={isEditGroupModalOpen}
          onClose={closeEditGroupModal}
          onSave={handleSaveGroup}
          initialData={{
            id: selectedGroup.id,
            name: selectedGroup.name,
            studentAmount: selectedGroup.student_amount,
            groupType: selectedGroup.group_type,
            groupLevel: selectedGroup.group_level,
            facultyId: selectedGroup.faculty_id,
            courseId: selectedGroup.course_id,
            specialityId: selectedGroup.speciality_id,
          }}
        />
      )} */}
    </div>
  );
};

export default Groups;