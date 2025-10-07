import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../api/service';
import useSweetAlert from '../../hooks/useSweetAlert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

interface Faculty {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

// Rol ID və adlarını sabitləşdiririk (Daha rahat istifadə üçün)
const DEPARTMENT_ADMIN_ROLE_ID = 11;
const DEPARTMENT_ADMIN_ROLE_NAME = 'DepartmentAdmin';
const FACULTY_ADMIN_ROLE_NAME = 'FacultyAdmin';
const TEACHER_ROLE_NAME = 'teacher';
const ADMIN_ROLE_NAME = 'admin';
const SUPER_ADMIN_ROLE_NAME = 'SuperAdmin';

const AddNewUser: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // ID state-ləri
    const [roleId, setRoleId] = useState<number | null>(null);
    const [facultyId, setFacultyId] = useState<number | null>(null);
    const [departmentId, setDepartmentId] = useState<number | null>(null); // Yeni state

    // Data state-ləri
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]); // Yeni state
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDepartmentLoading, setIsDepartmentLoading] = useState(false); // Yeni loading state

    const { errorAlert, successAlert } = useSweetAlert();

    // Seçilmiş rol obyektini tez tapmaq üçün
    const selectedRole = useMemo(() => allRoles.find(role => role.id === roleId), [roleId, allRoles]);

    // Fakültə və Rolları yüklə
    useEffect(() => {
        const fetchFacultiesAndRoles = async () => {
            try {
                const [facultiesRes, rolesRes] = await Promise.all([
                    get('/api/faculties'),
                    get('/api/roles')
                ]);
                setFaculties(facultiesRes.data);
                setAllRoles(rolesRes.data);
            } catch (err: any) {
                errorAlert('Xəta', err.message || 'Məlumatlar yüklənmədi');
            }
        };
        fetchFacultiesAndRoles();
        // eslint-disable-next-line
    }, []);

    // Fakültə seçimi dəyişəndə Kafedraları yüklə
    useEffect(() => {
        // Əgər rol DepartmentAdmin və ya teacher-dirsə, və fakültə seçilibsə
        if (facultyId && (selectedRole?.name === DEPARTMENT_ADMIN_ROLE_NAME || selectedRole?.name === TEACHER_ROLE_NAME)) {
            setIsDepartmentLoading(true);
            setDepartments([]);
            setDepartmentId(null); // Yeni fakültə seçildikdə kafedranı sıfırla

            get(`/api/faculty-departments/${facultyId}`)
                .then((res) => {
                    setDepartments(res.data);
                })
                .catch((err: any) => {
                    errorAlert('Xəta', err.message || 'Kafedralar yüklənmədi');
                    setDepartments([]);
                })
                .finally(() => setIsDepartmentLoading(false));
        } else {
            setDepartments([]);
            setDepartmentId(null);
        }
        // eslint-disable-next-line
    }, [facultyId, selectedRole]);


    // Rol dəyişəndə fakültə və kafedra seçimini idarə et
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRoleId = Number(e.target.value);
        setRoleId(newRoleId);

        const newSelectedRole = allRoles.find(role => role.id === newRoleId);

        // Əgər rol Admin və ya SuperAdmin-dirsə, fakültə/kafedranı sıfırla
        if (newSelectedRole?.name === ADMIN_ROLE_NAME || newSelectedRole?.name === SUPER_ADMIN_ROLE_NAME) {
            setFacultyId(null);
            setDepartmentId(null);
        }
        // Başqa rollarda dəyərlər saxlanılır ki, istifadəçi fakültə seçimi edə bilsin.
    };

    // Form Submit zamanı əlavə validasiya və göndərmə
    const handleAddUser = async () => {
        setIsLoading(true);

        const roleName = selectedRole?.name;

        // 1. Admin/SuperAdmin yoxlaması
        if ((roleName === ADMIN_ROLE_NAME || roleName === SUPER_ADMIN_ROLE_NAME) && (facultyId || departmentId)) {
            errorAlert('Xəta', `${roleName} heç bir fakültə və ya kafedraya əlavə oluna bilməz.`);
            setIsLoading(false);
            return;
        }

        // 2. FacultyAdmin yoxlaması
        if (roleName === FACULTY_ADMIN_ROLE_NAME && (!facultyId || departmentId)) {
             errorAlert('Xəta', 'FacultyAdmin yalnız bir fakültəyə əlavə olunmalıdır və kafedraya aid ola bilməz.');
             setIsLoading(false);
             return;
        }
        
        // 3. DepartmentAdmin və Teacher yoxlaması (Yeni məntiq)
        if ((roleName === DEPARTMENT_ADMIN_ROLE_NAME || roleName === TEACHER_ROLE_NAME) && (!facultyId || !departmentId)) {
            errorAlert('Xəta', `${roleName} yalnız Fakültə və Kafedra seçildikdə əlavə oluna bilər.`);
            setIsLoading(false);
            return;
        }

        // POST Data-nı hazırlayırıq
        const data = {
            name,
            surname,
            email,
            password,
            role_id: roleId,
            // Yalnız FacultyAdmin, DepartmentAdmin və ya teacher üçün göndərilir
            faculty_id: facultyId,
            // Yalnız DepartmentAdmin və ya teacher üçün göndərilir
            department_id: departmentId
        };
        
        try {
            await post('/api/users', data);
            successAlert('Uğurlu', 'İstifadəçi əlavə olundu.');
            navigate('/users');
        } catch (err: any) {
            // API-dən gələn error mesajını göstər
            const errorMessage = err?.response?.data?.message || err?.message || 'İstifadəçi əlavə olunmadı';
            errorAlert('Xəta', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        // Əsas sahələrin yoxlanılması
        if (!name || !surname || !email || !password || !roleId) return false;

        const roleName = selectedRole?.name;

        // Fakultə Admini tələbləri
        if (roleName === FACULTY_ADMIN_ROLE_NAME && !facultyId) return false;

        // DepartmentAdmin və ya Teacher tələbləri
        if ((roleName === DEPARTMENT_ADMIN_ROLE_NAME || roleName === TEACHER_ROLE_NAME) && (!facultyId || !departmentId)) return false;

        return true;
    };


    // Kafedra seçimi tələb olunurmu?
    const isDepartmentRequired = selectedRole?.id === DEPARTMENT_ADMIN_ROLE_ID || selectedRole?.name === TEACHER_ROLE_NAME;
    
    // Fakültə seçimi tələb olunurmu?
    const isFacultyRequired = isDepartmentRequired || selectedRole?.name === FACULTY_ADMIN_ROLE_NAME;


    return (
        <div className="space-y-6">
            <Breadcrumb pageName="Yeni İstifadəçi Əlavə Et" />
            <div className="mx-auto">
                <div className="bg-white shadow rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-indigo-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">Yeni İstifadəçi Əlavə Et</h2>
                    </div>
                    <div className="p-6 sm:p-8">
                        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleAddUser(); }}>
                            
                            {/* Personal Information Section (Eyni qalır) */}
                            <div className="border-b border-gray-100 pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Şəxsi Məlumatlar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ad *</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Adınızı daxil edin"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Soyad *</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                                            value={surname}
                                            onChange={(e) => setSurname(e.target.value)}
                                            placeholder="Soyadınızı daxil edin"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role, Faculty, and Department Section (Dəyişdirildi) */}
                            <div className="border-b border-gray-100 pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Rol, Fakültə və Kafedra
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Rol */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
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
                                    
                                    {/* Fakültə */}
                                    {isFacultyRequired && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fakültə {isFacultyRequired ? '*' : ''}
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                                                value={facultyId || ''}
                                                onChange={(e) => setFacultyId(Number(e.target.value) || null)}
                                                required={isFacultyRequired}
                                            >
                                                <option value="">Fakültə seçin</option>
                                                {faculties.map((faculty) => (
                                                    <option key={faculty.id} value={faculty.id}>
                                                        {faculty.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Kafedra */}
                                    {isDepartmentRequired && isFacultyRequired && (
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kafedra *
                                            </label>
                                            <select
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${!facultyId || isDepartmentLoading || departments.length === 0 ? 'bg-gray-50 opacity-60' : ''}`}
                                                value={departmentId || ''}
                                                onChange={(e) => setDepartmentId(Number(e.target.value) || null)}
                                                disabled={!facultyId || isDepartmentLoading || departments.length === 0}
                                                required={isDepartmentRequired}
                                            >
                                                <option value="">Kafedra seçin</option>
                                                {isDepartmentLoading ? (
                                                     <option disabled>Yüklənir...</option>
                                                ) : (
                                                    departments.map((department) => (
                                                        <option key={department.id} value={department.id}>
                                                            {department.name}
                                                        </option>
                                                    ))
                                                )}
                                                {!isDepartmentLoading && facultyId && departments.length === 0 && (
                                                    <option disabled>Bu fakültədə kafedra yoxdur</option>
                                                )}
                                            </select>
                                        </div>
                                    )}
                                    
                                    {/* Admin və SuperAdmin üçün İzah */}
                                    {(selectedRole?.name === ADMIN_ROLE_NAME || selectedRole?.name === SUPER_ADMIN_ROLE_NAME) && (
                                         <p className="text-sm text-gray-500 mt-1 col-span-full md:col-span-1">
                                            Admin və SuperAdmin üçün fakültə/kafedra seçimi tələb olunmur.
                                         </p>
                                    )}
                                </div>
                            </div>

                            {/* Account Information Section (Eyni qalır) */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Hesab Məlumatları</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="email@example.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Şifrə *</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Şifrənizi daxil edin"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons (Eyni qalır) */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button
                                    type="submit"
                                    className={`flex-1 sm:flex-none px-8 py-3 rounded-md font-medium transition-all duration-200 ${
                                        isFormValid() && !isLoading
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    disabled={!isFormValid() || isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Əlavə edilir...
                                        </div>
                                    ) : (
                                        'İstifadəçi Əlavə Et'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 sm:flex-none px-8 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-all duration-200"
                                    onClick={() => navigate('/users')}
                                >
                                    Ləğv et
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewUser;