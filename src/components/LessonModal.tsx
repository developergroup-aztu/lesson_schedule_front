import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Search, Loader2 } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { useAuth } from '../Context/AuthContext';
import { dayNames, mockScheduleData } from '../data/mockData';
import { post, get, put } from '../api/service';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import useSweetAlert from '../hooks/useSweetAlert';
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
      setIsOpen(!isOpen);
      if (!isOpen) {
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
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>

      {isOpen && !disabled && (
<div
          className={`
            absolute z-50 bg-white border border-gray-200 rounded-lg w-full shadow-xl overflow-hidden
            ${dropdownDirection === 'top' ? 'bottom-full mb-2' : 'top-full mt-1'}
          `}
        >          {/* Search input */}
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
            {filtered.length === 0 ? (
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { successAlert, errorAlert } = useSweetAlert();

  // Form state
  const [formData, setFormData] = useState<any>({
    group_id: modalData.groupId ? [modalData.groupId] : [],
    day_id: modalData.dayId || '',
    hour_id: modalData.hourId || '',
    subject_id: '',
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

  // Modal açılan anda bütün select datalarını yığ
  useEffect(() => {
    if (!facultyId || !isOpen) return;
    setIsLoading(true);
    setErrors({});

    const fetchAll = async () => {
      try {
        const [
          groupsRes,
          hoursRes,
          lessonTypesRes,
          weekTypesRes,
          professorsRes,
          roomsRes, // otaqlar üçün ayrıca endpoint
        ] = await Promise.all([
          get(`/api/groups?faculty_id=${facultyId}`),
          get('/api/hours'),
          get('/api/lesson_types'),
          get('/api/week_types'),
          get('/api/professors'),
          get('/api/rooms'), // yeni otaq endpointi
        ]);

        setGroups(groupsRes.data || []);
        setHours(hoursRes.data || []);
        setLessonTypes(lessonTypesRes.data || []);
        setWeekTypes(weekTypesRes.data || []);
        setProfessors(professorsRes.data || []);
        setSubjects(mockScheduleData.subjects || []);
        setRooms(roomsRes.data || []); // otaqları API-dən al
      } catch (error) {
        console.error('Data loading failed:', error);
        setGroups([]);
        setHours([]);
        setLessonTypes([]);
        setWeekTypes([]);
        setProfessors([]);
        setSubjects(mockScheduleData.subjects || []);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [facultyId, isOpen]);
  // Edit və ya add üçün formu doldur
  useEffect(() => {
    if (modalData.lesson) {
      setFormData({
        group_id: [modalData.groupId],
        day_id: modalData.dayId,
        hour_id: modalData.hourId,
        subject_id: modalData.lesson.subject_id,
        lesson_type_id: modalData.lesson.lesson_type_id,
        week_type_id: modalData.lesson.week_type_id,
        // Düzəliş: teacher_code üçün həmişə external_id istifadə et
        teacher_code: modalData.lesson.teacher_code || '', // teacher_code artıq external_id-dir
        room_id: modalData.lesson.room_id || '',
      });
    } else {
      setFormData({
        group_id: modalData.groupId ? [modalData.groupId] : [],
        day_id: modalData.dayId || '',
        hour_id: modalData.hourId || '',
        subject_id: '',
        lesson_type_id: '',
        week_type_id: modalData.weekTypeId || '',
        teacher_code: '',
        room_id: '',
      });
    }
    setErrors({});
  }, [modalData]);


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
    if (!formData.subject_id) {
      newErrors.subject_id = 'Fənn seçilməlidir';
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
    // Otaq yalnız FacultyAdmin deyilse tələb olunsun
    if (!isFacultyAdmin && !formData.room_id) {
      newErrors.room_id = 'Otaq seçilməlidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Field dəyişəndə
  const handleFieldChange = (value: any, { name }: { name: string }) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    // Xətanı təmizlə
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
      subject_id: Number(formData.subject_id),
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 size={20} className="animate-spin text-blue-600" />
              <span className="text-gray-600">Məlumatlar yüklənir...</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        {!isLoading && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Qrup, Gün, Saat */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qrup <span className="text-red-500">*</span>
                  </label>
                 <VirtualSelect
  value={formData.group_id}
  onChange={handleFieldChange}
  name="group_id"
  options={groups.map((group) => ({
    id: group.id || group.group_id,
    name: group.name || group.group_name,
  }))}
  required
  error={!!errors.group_id}
  placeholder="Qrup seçin"
  disabled={modalData.mode === 'add' && !!formData.group_id && formData.group_id.length > 0}
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
                  value={formData.subject_id}
                  onChange={handleFieldChange}
                  name="subject_id"
                  options={subjects.map((subject) => ({
                    id: subject.subject_id || subject.id,
                    name: subject.subject_name || subject.name,
                  }))}
                  required
                  error={!!errors.subject_id}
                  placeholder="Fənn seçin"
                  searchPlaceholder="Fənn axtarın..."
                />
                {errors.subject_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.subject_id}
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
                      id: prof.external_id, // external_id POST üçün və seçili dəyər üçün istifadə olunur
                      name: `${prof.name || ''} ${prof.surname || ''}`.trim(),
                    }))}
                    required
                    error={!!errors.teacher_code}
                    placeholder="Müəllim seçin"
                    searchPlaceholder="Müəllim axtarın..."
                    dropdownDirection="top"
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
        )}
      </div>
    </div>
  );
};

export default LessonModal;
