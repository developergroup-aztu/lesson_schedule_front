import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, put } from '../api/service';
import usePermissions from '../hooks/usePermissions';
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

interface MultiSelectOption {
  label: string;
  value: number;
}

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [duty, setDuty] = useState('');
  const [employeeType, setEmployeeType] = useState('');
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [departmentIds, setDepartmentIds] = useState<number[]>([]);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<MultiSelectOption[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const hasEditPermission = usePermissions('edit_user');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await get(`/api/users/${id}`);
        const userData = response.data;
        setName(userData.name || '');
        setSurname(userData.surname || '');
        setPatronymic(userData.patronymic || '');
        setDuty(userData.duty || '');
        setEmployeeType(userData.employee_type || '');
        setFacultyId(userData.faculty?.id || null);
        
        // Departmentları array kimi əldə et
        const deptIds = Array.isArray(userData.department_names) 
          ? userData.department_names.map((d: any) => d.id) 
          : Object.keys(userData.department_names || {}).map(key => parseInt(key));
        
        setDepartmentIds(deptIds);
      
        setEmail(userData.email || '');
        setRoleId(Array.isArray(userData.roles) 
          ? userData.roles[0] 
          : Object.values(userData.roles)[0] || null);
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || 'An error occurred');
      }
    };

    const fetchFaculties = async () => {
      try {
        const response = await get('/api/faculties');
        setFaculties(response.data);
      } catch (err: any) {
        console.error('Error fetching faculties:', err);
        setError(err.message || 'An error occurred');
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await get('/api/departments');
        setDepartments(response.data);
      } catch (err: any) {
        console.error('Error fetching departments:', err);
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

    fetchUser();
    fetchFaculties();
    fetchDepartments();
    fetchRoles();
  }, [id]);

  // Fakultə dəyişdikdə uyğun departmentləri yüklə
  useEffect(() => {
    if (facultyId) {
      const selectedFaculty = faculties.find(faculty => faculty.id === facultyId);
      if (selectedFaculty) {
        // Fakultə dəyişdikdə mövcud departmentləri əvəz et
        setDepartments(selectedFaculty.departments);
        
        // Əvvəlki seçimlərdən yalnız yeni fakultəyə aid olanları saxla
        const validDeptIds = selectedFaculty.departments.map(dept => dept.id);
        const filteredDeptIds = departmentIds.filter(deptId => validDeptIds.includes(deptId));
        setDepartmentIds(filteredDeptIds);
        
        // MultiSelect üçün seçilmiş departmentləri yenilə
        updateSelectedDepartments(filteredDeptIds, selectedFaculty.departments);
      }
    } else {
      setDepartments([]);
      setDepartmentIds([]);
      setSelectedDepartments([]);
    }
  }, [facultyId, faculties]);

  // DepartmentIds dəyişdikdə selectedDepartments state-ni yenilə
  useEffect(() => {
    if (departments.length > 0) {
      updateSelectedDepartments(departmentIds, departments);
    }
  }, [departmentIds, departments]);

  // Seçilmiş departmentləri MultiSelect formatına çevir
  const updateSelectedDepartments = (deptIds: number[], availableDepts: Department[]) => {
    const selected = deptIds
      .map(id => {
        const dept = availableDepts.find(d => d.id === id);
        return dept ? { label: dept.name, value: dept.id } : null;
      })
      .filter((item): item is MultiSelectOption => item !== null);
    
    setSelectedDepartments(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      let payload: any = {
        name,
        surname,
        patronymic,
        duty,
        employee_type: employeeType,
        email,
        role_id: roleId,
      };

      if (roleId !== 3) { // Əgər admin deyilsə
        payload.faculty_id = facultyId;
        // null və undefined dəyərləri göndərməmək üçün filter et
        payload.department_ids = departmentIds.filter((id) => id !== null && id !== undefined);
      }

      await put(`/api/users/${id}`, payload);
      navigate('/users');
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'An error occurred');
      setIsErrorModalOpen(true);
    }
  };

  const handleDepartmentChange = (selectedOptions: MultiSelectOption[]) => {
    // MultiSelect-dən seçilmiş dəyərləri əldə et
    const ids = selectedOptions
      .map(option => option.value)
      .filter(id => id !== null && id !== undefined);
    
    setDepartmentIds(ids);
  };

  const handleModalClose = () => {
    setIsErrorModalOpen(false);
    setError(null);
  };

  if (!hasEditPermission) {
    return <div>İcazəniz yoxdur</div>;
  }

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">İstifadəçini Redaktə Et</h2>
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
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Ad
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="surname"
            className="block text-sm font-medium text-gray-700"
          >
            Soyad
          </label>
          <input
            id="surname"
            name="surname"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="patronymic"
            className="block text-sm font-medium text-gray-700"
          >
            Ata adı
          </label>
          <input
            id="patronymic"
            name="patronymic"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={patronymic}
            onChange={(e) => setPatronymic(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="duty"
            className="block text-sm font-medium text-gray-700"
          >
            Vəzifə
          </label>
          <input
            id="duty"
            name="duty"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={duty}
            onChange={(e) => setDuty(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="employeeType"
            className="block text-sm font-medium text-gray-700"
          >
            İşçi növü
          </label>
          <input
            id="employeeType"
            name="employeeType"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={employeeType}
            onChange={(e) => setEmployeeType(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="facultyId"
            className="block text-sm font-medium text-gray-700"
          >
            Fakültə
          </label>
          <select
            id="facultyId"
            name="facultyId"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
        <div>
          <label
            htmlFor="departmentIds"
            className="block text-sm font-medium text-gray-700"
          >
            Kafedra
          </label>
          <MultiSelect
            options={departments.map(department => ({ label: department.name, value: department.id }))}
            value={selectedDepartments}
            onChange={handleDepartmentChange}
            labelledBy="Kafedra seçin"
            hasSelectAll={roleId !== 11}
            disabled={!facultyId}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="roleId"
            className="block text-sm font-medium text-gray-700"
          >
            Rol
          </label>
          <select
            id="roleId"
            name="roleId"
            required
            className="w-full px-3 py-2 border rounded-lg"
            value={roleId || ''}
            onChange={(e) => {
              setRoleId(Number(e.target.value));
              // Rol dəyişdikdə department seçimlərini sıfırla (əgər lazımdırsa)
              if (Number(e.target.value) === 3) { // Admin rolü üçün
                setFacultyId(null);
                setDepartmentIds([]);
                setSelectedDepartments([]);
              }
            }}
          >
            <option value="">Rol seçin</option>
            {allRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Yenilə
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;