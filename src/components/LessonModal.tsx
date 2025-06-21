import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Search, Loader2 } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { useAuth } from '../Context/AuthContext';
import { dayNames, mockScheduleData } from '../data/mockData';
import { post, get, put } from '../api/service';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import useSweetAlert from '../hooks/useSweetAlert';
import { ClimbingBoxLoader } from 'react-spinners';

// Təkmilləşdirilmiş VirtualSelect komponenti
const VirtualSelect = ({
  value,
  onChange,
  name,
  options = [],
  labelKey = 'name',
  placeholder = 'Seçin',
  required = false,
  disabled = false,
  searchPlaceholder = 'Axtarış...',
  error = false,
  dropdownDirection = 'bottom',
  onOpen, // Yeni prop - select açılanda çağırılır
  isLoading = false, // Loading state
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter((opt) =>
    (opt[labelKey] || opt.name || opt.label || '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const selected = options.find(
    (opt) => (opt.id || opt.value)?.toString() === value?.toString(),
  );

  // Kənarda klik olunanda bağla
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Escape key ilə bağla
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Açılanda search input-a focus et
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        // Select açılarkən onOpen callback-i çağır
        if (onOpen) {
          onOpen();
        }
        setIsOpen(true);
        setSearch('');
      } else {
        setIsOpen(false);
        setSearch('');
      }
    }
  };

  const handleSelect = (option) => {
    onChange(option.id || option.value, { name });
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`
          w-full px-3 py-2.5 border rounded-lg text-left bg-white flex items-center justify-between
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'hover:border-gray-400'
          }
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}
        `}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected
            ? selected[labelKey] || selected.name || selected.label
            : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
              }`}
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div
          className={`
            absolute z-50 bg-white border border-gray-200 rounded-lg w-full shadow-xl overflow-hidden
            ${dropdownDirection === 'top' ? 'bottom-full mb-2' : 'top-full mt-1'}
          `}
        >
          {/* Search input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 size={20} className="animate-spin text-blue-600 mx-auto mb-2" />
                <span className="text-gray-500 text-sm">Yüklənir...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm text-center">
                Heç nə tapılmadı
              </div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.id || opt.value}
                  className={`
                    px-3 py-2.5 cursor-pointer transition-colors duration-150
                    hover:bg-blue-50 hover:text-blue-900
                    ${value?.toString() === (opt.id || opt.value)?.toString()
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-gray-700'
                    }
                  `}
                  onClick={() => handleSelect(opt)}
                >
                  {opt[labelKey] || opt.name || opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: any;
  mode?: 'cell';
  onSuccess?: () => void;
}

const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  modalData,
  mode = 'cell',
  onSuccess = () => { },
}) => {
  const { scheduleData } = useSchedule();
  const { user } = useAuth();
  const modalRef = useRef(null);
  const params = useParams();

  const facultyId =
    user.faculty_id || scheduleData.faculty?.faculty_id || params.id;

  const facultyName = user?.faculty_name || scheduleData.faculty?.faculty_name;

  const isFacultyAdmin = user?.roles.includes('FacultyAdmin');

  // Select dataları üçün state-lər
  const [groups, setGroups] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [lessonTypes, setLessonTypes] = useState<any[]>([]);
  const [weekTypes, setWeekTypes] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);

  // Loading state-lər hər select üçün ayrıca
  const [loadingStates, setLoadingStates] = useState({
    groups: false,
    hours: false,
    subjects: false,
    rooms: false,
    lessonTypes: false,
    weekTypes: false,
    professors: false,
  });

  // Hansı selectlərin data yükləndiyi
  const [loadedData, setLoadedData] = useState({
    groups: false,
    hours: false,
    subjects: false,
    rooms: false,
    lessonTypes: false,
    weekTypes: false,
    professors: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { successAlert, errorAlert } = useSweetAlert();

  // Form state
  const [formData, setFormData] = useState<any>({
    group_id: modalData.groupId ? [modalData.groupId] : [],
    day_id: modalData.dayId || '',
    hour_id: modalData.hourId || '',
    lesson_id: '',
    lesson_type_id: '',
    week_type_id: '',
    teacher_code: '',
    room_id: '',
  });

  // Modal backdrop click ilə bağla
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Escape key ilə bağla
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isSubmitting, onClose]);

  // Body scroll-u blokla
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Edit mode-da modal açılan anda bütün dataları yüklə
  useEffect(() => {
    if (!facultyId || !isOpen) return;

    // Yalnız edit mode-da modal açılan anda bütün dataları yüklə
    if (modalData.mode === 'edit' && modalData.lesson) {
      const fetchAllData = async () => {
        try {
          const [
            groupsRes,
            hoursRes,
            lessonTypesRes,
            weekTypesRes,
            professorsRes,
            roomsRes,
          ] = await Promise.all([
            get(`/api/groups?faculty_id=${facultyId}`),
            get('/api/hours'),
            get('/api/lesson-types'),
            get('/api/week-types'),
            get('/api/professors'),
            get('/api/rooms'),
          ]);

          setGroups(groupsRes.data || []);
          setHours(hoursRes.data || []);
          setLessonTypes(lessonTypesRes.data || []);
          setWeekTypes(weekTypesRes.data || []);
          setProfessors(professorsRes.data || []);
          setRooms(roomsRes.data || []);
          setSubjects(mockScheduleData.subjects || []);

          // Bütün dataların yükləndiyi qeyd et
          setLoadedData({
            groups: true,
            hours: true,
            subjects: true,
            rooms: true,
            lessonTypes: true,
            weekTypes: true,
            professors: true,
          });
        } catch (error) {
          console.error('Data loading failed:', error);
          errorAlert('Xəta', 'Məlumatlar yüklənərkən xəta baş verdi');
        }
      };

      fetchAllData();
    }
  }, [facultyId, isOpen, modalData.mode, modalData.lesson]);

  // Edit və ya add üçün formu doldur
  useEffect(() => {
    if (modalData.lesson) {
      setFormData({
        group_id: [modalData.groupId],
        day_id: modalData.dayId,
        hour_id: modalData.hourId,
        lesson_id: modalData.lesson.lesson_id,
        lesson_type_id: modalData.lesson.lesson_type_id,
        week_type_id: modalData.lesson.week_type_id,
        teacher_code: modalData.lesson.teacher_code || '',
        room_id: modalData.lesson.room_id || '',
      });
    } else {
      setFormData({
        group_id: modalData.groupId ? [modalData.groupId] : [],
        day_id: modalData.dayId || '',
        hour_id: modalData.hourId || '',
        lesson_id: '',
        lesson_type_id: '',
        week_type_id: modalData.weekTypeId || '',
        teacher_code: '',
        room_id: '',
      });
    }
    setErrors({});
  }, [modalData]);

  // Lazy loading funksiyaları
  const loadGroups = async () => {
    if (loadedData.groups || loadingStates.groups) return;

    setLoadingStates(prev => ({ ...prev, groups: true }));
    try {
      const response = await get(`/api/groups?faculty_id=${facultyId}`);
      setGroups(response.data || []);
      setLoadedData(prev => ({ ...prev, groups: true }));
    } catch (error) {
      console.error('Groups loading failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, groups: false }));
    }
  };

  const loadHours = async () => {
    if (loadedData.hours || loadingStates.hours) return;

    setLoadingStates(prev => ({ ...prev, hours: true }));
    try {
      const response = await get('/api/hours');
      setHours(response.data || []);
      setLoadedData(prev => ({ ...prev, hours: true }));
    } catch (error) {
      console.error('Hours loading failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, hours: false }));
    }
  };

  const loadSubjects = async (groupId?: any) => {
    // Əgər groupId verilməyibsə, formData-dan götür
    const gid = groupId || (formData.group_id && formData.group_id.length > 0 ? formData.group_id[0] : null);

    console.log('Loading subjects for group:', gid);

    if (!gid) {
      setSubjects([]);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, subjects: true }));

    try {
      const res = await get(`/api/groups/${gid}/lectures`);

      // API cavabını yoxlayın - data field-də array var
      let subjectsData = [];
      if (res.data && Array.isArray(res.data)) {
        subjectsData = res.data;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        subjectsData = res.data.data;
      } else if (Array.isArray(res)) {
        subjectsData = res;
      }

      setSubjects(subjectsData);
      setLoadedData((prev) => ({ ...prev, subjects: true }));
      console.log('Subjects loaded:', subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
      setLoadedData((prev) => ({ ...prev, subjects: false }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, subjects: false }));
    }
  };

  useEffect(() => {
    // Edit mode-da və lesson mövcud olduqda
    if (modalData.lesson && modalData.groupId) {
      // Digər dataları yüklədikdən sonra fənləri də yüklə
      loadSubjects(modalData.groupId);
    }
  }, [modalData.lesson, modalData.groupId]);


  const loadLessonTypes = async () => {
    if (loadedData.lessonTypes || loadingStates.lessonTypes) return;

    setLoadingStates(prev => ({ ...prev, lessonTypes: true }));
    try {
      const response = await get('/api/lesson-types');
      setLessonTypes(response.data || []);
      setLoadedData(prev => ({ ...prev, lessonTypes: true }));
    } catch (error) {
      console.error('Lesson types loading failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, lessonTypes: false }));
    }
  };

  const loadWeekTypes = async () => {
    if (loadedData.weekTypes || loadingStates.weekTypes) return;

    setLoadingStates(prev => ({ ...prev, weekTypes: true }));
    try {
      const response = await get('/api/week-types');
      setWeekTypes(response.data || []);
      setLoadedData(prev => ({ ...prev, weekTypes: true }));
    } catch (error) {
      console.error('Week types loading failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, weekTypes: false }));
    }
  };

  const loadProfessors = async () => {
    if (loadedData.professors || loadingStates.professors) return;

    setLoadingStates(prev => ({ ...prev, professors: true }));
    try {
      const response = await get('/api/professors');
      setProfessors(response.data || []);
      setLoadedData(prev => ({ ...prev, professors: true }));
    } catch (error) {
      console.error('Professors loading failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, professors: false }));
    }
  };

  const loadRooms = async () => {
    if (loadedData.rooms || loadingStates.rooms) return;

    setLoadingStates(prev => ({ ...prev, rooms: true }));
    try {
      const response = await get('/api/rooms');
      setRooms(response.data || []);
      setLoadedData(prev => ({ ...prev, rooms: true }));
    } catch (error) {
      console.error('Rooms loading failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, rooms: false }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.group_id || formData.group_id.length === 0) {
      newErrors.group_id = 'Qrup seçilməlidir';
    }
    if (!formData.day_id) {
      newErrors.day_id = 'Gün seçilməlidir';
    }
    if (!formData.hour_id) {
      newErrors.hour_id = 'Saat seçilməlidir';
    }
    if (!formData.lesson_id) {
      newErrors.lesson_id = 'Fənn seçilməlidir';
    }
    if (!formData.lesson_type_id) {
      newErrors.lesson_type_id = 'Dərs tipi seçilməlidir';
    }
    if (!formData.week_type_id) {
      newErrors.week_type_id = 'Həftə tipi seçilməlidir';
    }
    if (!formData.teacher_code) {
      newErrors.teacher_code = 'Müəllim seçilməlidir';
    }
    if (!isFacultyAdmin && !formData.room_id) {
      newErrors.room_id = 'Otaq seçilməlidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Field dəyişəndə
  const handleFieldChange = (value: any, { name }: { name: string }) => {
    setFormData((prev: any) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };

      // Əgər qrup dəyişibsə, lesson_id-ni sıfırla və fənləri yüklə
      if (name === 'group_id' && value) {
        // Array-dən first element-i götür
        const groupId = Array.isArray(value) ? value[0] : value;

        if (groupId) {
          // Subject-i sıfırla
          newFormData.lesson_id = '';

          // Fənləri yüklə
          loadSubjects(groupId);

          // Subjects loaded state-ni false et ki, yenidən yüklənsin
          setLoadedData(prev => ({ ...prev, subjects: false }));
        }
      }

      return newFormData;
    });

    // Error-u təmizlə
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const groupIds = Array.isArray(formData.group_id)
        ? formData.group_id
        : [formData.group_id];

      const postData: any = {
        faculty_id: facultyId,
        group_id: groupIds[0],
        day_id: Number(formData.day_id),
        hour_id: Number(formData.hour_id),
        week_type_id: Number(formData.week_type_id),
        lesson_id: Number(formData.lesson_id),
        lesson_type_id: Number(formData.lesson_type_id),
        teacher_code: formData.teacher_code,
        ...(isFacultyAdmin ? {} : { room_id: Number(formData.room_id) }),
      };

      if (modalData.mode === 'edit' && modalData.lesson?.schedule_id) {
        postData.schedule_group_id = modalData.lesson.schedule_group_id;
        await put(`/api/schedules/${modalData.lesson.schedule_id}`, postData);
        successAlert('Uğurlu', 'Dərs uğurla yeniləndi!');
      } else {
        postData.group_ids = groupIds;
        await post('/api/schedules', postData);
        successAlert('Uğurlu', 'Dərs uğurla əlavə olundu!');
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      let message = 'Xəta baş verdi! Zəhmət olmasa yenidən cəhd edin.';
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      errorAlert('Xəta', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {modalData.mode === 'add'
                ? 'Yeni Dərs Əlavə Et'
                : 'Dərsi Redaktə Et'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{facultyName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Qrup, Gün, Saat */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qrup <span className="text-red-500">*</span>
                </label>

<VirtualSelect
  value={formData.group_id && formData.group_id.length > 0 ? formData.group_id[0] : ''}
  onChange={(value) => handleFieldChange([value], { name: 'group_id' })}
  name="group_id"
  options={groups.map((group) => ({
    id: group.id || group.group_id,
    name: group.name || group.group_name,
  }))}
  required
  error={!!errors.group_id}
  placeholder="Qrup seçin"
  // Cell modunu tanımaq üçün alternativ yollar:

// Variant 1: modalData.mode və mode prop-larını yoxla
disabled={(modalData.mode === 'cell' || modalData.mode === 'edit' || mode === 'cell') && !!formData.group_id && formData.group_id.length > 0}

// Variant 2: modalData obyektində başqa fieldləri yoxla
disabled={(modalData.mode === 'edit' || (modalData.groupId && modalData.dayId && modalData.hourId && modalData.mode !== 'add')) && !!formData.group_id && formData.group_id.length > 0}

// Variant 3: Yalnız add modunda enable et (ən təhlükəsiz)
disabled={modalData.mode !== 'add' && !!formData.group_id && formData.group_id.length > 0}

// Variant 4: modalData.lesson mövcudluğunu yoxla (edit üçün)
disabled={(modalData.lesson || modalData.mode === 'edit') && !!formData.group_id && formData.group_id.length > 0}
  onOpen={loadGroups}
  isLoading={loadingStates.groups}
/>

                {errors.group_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.group_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gün <span className="text-red-500">*</span>
                </label>
                <VirtualSelect
                  value={formData.day_id}
                  onChange={handleFieldChange}
                  name="day_id"
                  options={[
                    { id: 1, name: 'Bazar ertəsi' },
                    { id: 2, name: 'Çərşənbə axşamı' },
                    { id: 3, name: 'Çərşənbə' },
                    { id: 4, name: 'Cümə axşamı' },
                    { id: 5, name: 'Cümə' },
                  ]}
                  required
                  error={!!errors.day_id}
                  placeholder="Gün seçin"
                />
                {errors.day_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.day_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saat <span className="text-red-500">*</span>
                </label>
                <VirtualSelect
                  value={formData.hour_id}
                  onChange={handleFieldChange}
                  name="hour_id"
                  options={hours.map((hour) => ({
                    id: hour.id,
                    name: hour.time,
                  }))}
                  required
                  error={!!errors.hour_id}
                  placeholder="Saat seçin"
                  onOpen={loadHours}
                  isLoading={loadingStates.hours}
                />
                {errors.hour_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.hour_id}
                  </p>
                )}
              </div>
            </div>

            {/* Fənn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fənn <span className="text-red-500">*</span>
              </label>
              <VirtualSelect
                value={formData.lesson_id}
                onChange={handleFieldChange}
                name="lesson_id"
                options={subjects.map((subject) => ({
                  id: subject.id,
                  name: subject.name,
                }))}
                required
                error={!!errors.lesson_id}
                placeholder={
                  formData.group_id && formData.group_id.length > 0
                    ? (loadingStates.subjects ? "Fənlər yüklənir..." : "Fənn seçin")
                    : "Əvvəl qrup seçin"
                }
                disabled={!formData.group_id || formData.group_id.length === 0}
                searchPlaceholder="Fənn axtarın..."
                isLoading={loadingStates.subjects}
              />
              {errors.lesson_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lesson_id}
                </p>
              )}
            </div>

            {/* Dərs tipi və Həftə tipi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dərs tipi <span className="text-red-500">*</span>
                </label>
                <VirtualSelect
                  value={formData.lesson_type_id}
                  onChange={handleFieldChange}
                  name="lesson_type_id"
                  options={lessonTypes.map((type) => ({
                    id: type.lesson_type_id || type.id,
                    name: type.lesson_type || type.name,
                  }))}
                  required
                  error={!!errors.lesson_type_id}
                  placeholder="Dərs tipi seçin"
                  dropdownDirection="top"
                  onOpen={loadLessonTypes}
                  isLoading={loadingStates.lessonTypes}
                />
                {errors.lesson_type_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lesson_type_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Həftə tipi <span className="text-red-500">*</span>
                </label>
                <VirtualSelect
                  value={formData.week_type_id}
                  onChange={handleFieldChange}
                  name="week_type_id"
                  options={weekTypes.map((type) => ({
                    id: type.week_type_id || type.id,
                    name: type.week_type || type.name,
                  }))}
                  required
                  error={!!errors.week_type_id}
                  placeholder="Həftə tipi seçin"
                  dropdownDirection="top"
                  onOpen={loadWeekTypes}
                  isLoading={loadingStates.weekTypes}
                />
                {errors.week_type_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.week_type_id}
                  </p>
                )}
              </div>
            </div>

            {/* Müəllim və Otaq */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Müəllim <span className="text-red-500">*</span>
                </label>
                <VirtualSelect
                  value={formData.teacher_code}
                  onChange={handleFieldChange}
                  name="teacher_code"
                  options={professors.map((prof) => ({
                    id: prof.external_id,
                    name: `${prof.name || ''} ${prof.surname || ''}`.trim(),
                  }))}
                  required
                  error={!!errors.teacher_code}
                  placeholder="Müəllim seçin"
                  searchPlaceholder="Müəllim axtarın..."
                  dropdownDirection="top"
                  onOpen={loadProfessors}
                  isLoading={loadingStates.professors}
                />
                {errors.teacher_code && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.teacher_code}
                  </p>
                )}
              </div>
              {!isFacultyAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Otaq <span className="text-red-500">*</span>
                  </label>
                  <VirtualSelect
                    value={formData.room_id}
                    onChange={handleFieldChange}
                    name="room_id"
                    options={rooms.map((room) => ({
                      id: room.id,
                      name: `${room.name} (Tutum: ${room.room_capacity})`,
                    }))}
                    required
                    error={!!errors.room_id}
                    placeholder="Otaq seçin"
                    searchPlaceholder="Otaq axtarın..."
                    dropdownDirection="top"
                    onOpen={loadRooms}
                    isLoading={loadingStates.rooms}
                  />
                  {errors.room_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.room_id}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Buttons */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {modalData.mode === 'add' ? 'Əlavə et' : 'Yadda saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonModal;