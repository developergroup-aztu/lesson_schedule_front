import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../api/service';
import Modal from 'react-modal';
import { MultiSelect } from 'react-multi-select-component';
import '../css/Modal.css';

interface Faculty {
  id: number;
  name: string;
  departments: Department[];
}

interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

const AddNewUser: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [duty, setDuty] = useState('');
  const [employeeType, setEmployeeType] = useState('');
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [departmentIds, setDepartmentIds] = useState<number[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null); // Tek bir rol üçün state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await get('/api/faculties');
        setFaculties(response.data);
      } catch (err: any) {
        console.error('Error fetching faculties:', err);
        setError(err.message || 'An error occurred');
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await get('/api/roles');
        setAllRoles(response.data);
      } catch (err: any) {
        console.error('Error fetching roles:', err);
        setError(err.message || 'An error occurred');
      }
    };

    fetchFaculties();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (facultyId) {
      const selectedFaculty = faculties.find(faculty => faculty.id === facultyId);
      if (selectedFaculty) {
        setDepartments(selectedFaculty.departments);
      }
    } else {
      setDepartments([]);
    }
  }, [facultyId, faculties]);

  const handleAddUser = async () => {
    const selectedRole = allRoles.find(role => role.id === roleId);

    if ((selectedRole?.name === 'admin' || selectedRole?.name === 'SuperAdmin') && (facultyId || departmentIds.length > 0)) {
      setError('Admin və ya SuperAdmin heçbir fakültə və kafedraya əlavə oluna bilməz.');
      setIsErrorModalOpen(true);
      return;
    }

    if (selectedRole?.name === 'FacultyAdmin' && (!facultyId || departmentIds.length > 0)) {
      setError('FacultyAdmin yalnız bir fakültəyə əlavə olunmalıdır və kafedra seçilməməlidir.');
      setIsErrorModalOpen(true);
      return;
    }

    if (selectedRole?.name === 'DepartmentAdmin' && (!facultyId || departmentIds.length !== 1)) {
      setError('DepartmentAdmin yalnız bir kafedraya əlavə olunmalıdır və fakültə seçilməlidir.');
      setIsErrorModalOpen(true);
      return;
    }

    if (selectedRole?.name === 'teacher' && (!facultyId || departmentIds.length === 0)) {
      setError('Teacher bir fakültəyə və bir neçə kafedraya əlavə olunmalıdır.');
      setIsErrorModalOpen(true);
      return;
    }

    try {
      await post('/api/users', {
        name,
        surname,
        patronymic,
        duty,
        employee_type: employeeType,
        faculty_id: facultyId,
        department_ids: departmentIds,
        email,
        password,
        role_id: roleId,
      });
      navigate('/users');
    } catch (err: any) {
      console.error('Error adding user:', err);
      setError(err.message || 'An error occurred');
      setIsErrorModalOpen(true);
    }
  };

  const handleDepartmentChange = (selectedOptions: any) => {
    setDepartmentIds(selectedOptions ? selectedOptions.map((option: any) => option.value) : []);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoleId = Number(e.target.value);
    setRoleId(newRoleId);

    const selectedRole = allRoles.find(role => role.id === newRoleId);

    if (selectedRole?.name === 'admin' || selectedRole?.name === 'SuperAdmin' || selectedRole?.name === 'FacultyAdmin') {
      setDepartmentIds([]);
    }
  };

  const handleModalClose = () => {
    setIsErrorModalOpen(false);
    setError(null);
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Yeni İstifadəçi Əlavə Et</h2>
      <Modal
        isOpen={isErrorModalOpen}
        onRequestClose={handleModalClose}
        contentLabel="Error"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="text-xl font-bold mb-4">Xəta</h2>
        <p>{error}</p>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
          onClick={handleModalClose}
        >
          Bağla
        </button>
      </Modal>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Ad</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Soyad</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-500"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Ata adı</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-500"
          value={patronymic}
          onChange={(e) => setPatronymic(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Vəzifə</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-500"
          value={duty}
          onChange={(e) => setDuty(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">İşçi növü</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-500"
          value={employeeType}
          onChange={(e) => setEmployeeType(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Rol</label>
        <select
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-500"
          value={roleId || ''}
          onChange={handleRoleChange}
          required
        >
          <option value="">Rol seçin</option>
          {allRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Fakültə</label>
        <select
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-500"
          value={facultyId || ''}
          onChange={(e) => setFacultyId(Number(e.target.value))}
        >
          <option value="">Fakültə seçin</option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Kafedra</label>
        <MultiSelect
          options={departments.map(department => ({ label: department.name, value: department.id }))}
          value={departments.filter(department => departmentIds.includes(department.id)).map(department => ({ label: department.name, value: department.id }))}
          onChange={handleDepartmentChange}
          labelledBy="Kafedra seçin"
          hasSelectAll={roleId !== 11}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Email</label>
        <input
          type="email"
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Şifrə</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        onClick={handleAddUser}
      >
        Əlavə et
      </button>
    </div>
  );
};

export default AddNewUser;