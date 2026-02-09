import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';
import { useAuth } from '../../Context/AuthContext';
import { post, get } from '../../api/service';
import { useParams } from 'react-router-dom';
import useSweetAlert from '../../hooks/useSweetAlert';
import { ClipLoader } from 'react-spinners';
import VirtualSelect from '../Select/ScheduleSelect';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: any;
  onSuccess?: () => void;
}

const LessonModal: React.FC<AddLessonModalProps> = ({
  isOpen,
  onClose,
  modalData,
  onSuccess = () => { },
}) => {
  const { scheduleData } = useSchedule();
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  const facultyId = user.faculty_id || scheduleData.faculty?.faculty_id || params.id;
  const facultyName = user?.faculty_name || scheduleData.faculty?.faculty_name;
  const isFacultyAdmin = user?.roles.includes('FacultyAdmin');

  // State-lər
  const [groups, setGroups] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [lessonTypes, setLessonTypes] = useState<any[]>([]);
  const [weekTypes, setWeekTypes] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);

  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [shareWithOthers, setShareWithOthers] = useState(false);
  const [sharedGroups, setSharedGroups] = useState<any[]>([]);
  const [sharedGroupsLoading, setSharedGroupsLoading] = useState(false);
  const [sharedGroupsOptions, setSharedGroupsOptions] = useState<any[]>([]);

  // Loading state-lər
  const [loadingStates, setLoadingStates] = useState({
    groups: false,
    hours: false,
    subjects: false,
    rooms: false,
    lessonTypes: false,
    weekTypes: false,
    lessonTypeProfessors: false,
  });

  console.log(modalData)

  // Cache state-lər
  const [loadedData, setLoadedData] = useState({
    groups: false,
    hours: false,
    subjects: false,
    rooms: false,
    lessonTypes: false,
    weekTypes: false,
    lessonTypeProfessors: false,
  });

  const [currentSubjectsGroupId, setCurrentSubjectsGroupId] = useState<string | null>(null);
  const [currentLessonTypesLessonId, setCurrentLessonTypesLessonId] = useState<string | null>(null);
  const [currentProfessorsLessonTypeId, setCurrentProfessorsLessonTypeId] = useState<string | null>(null);

  const { successAlert, errorAlert } = useSweetAlert();

  // Form state
  const [formData, setFormData] = useState<any>({
    group_id: modalData.groupId ? [modalData.groupId] : [],
    day_id: modalData.dayId || '',
    hour_id: modalData.hourId || '',
    lesson_id: '',
    lesson_type_id: '',
    week_type_id: modalData.weekTypeId || '',
    teacher_code: '',
    room_id: '',
  });

  // Modal events
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGroups([]);
      setHours([]);
      setSubjects([]);
      setRooms([]);
      setLessonTypes([]);
      setWeekTypes([]);
      setProfessors([]);

      setLoadedData({
        groups: false,
        hours: false,
        subjects: false,
        rooms: false,
        lessonTypes: false,
        weekTypes: false,
        lessonTypeProfessors: false,
      });

      setCurrentSubjectsGroupId(null);
      setCurrentLessonTypesLessonId(null);
      setCurrentProfessorsLessonTypeId(null);
      setErrors({});
    }
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
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
    setErrors({});
  }, [modalData]);

  // Initial data loading
  useEffect(() => {
    if (!facultyId || !isOpen) return;

    const isCellMode = modalData.groupId && modalData.dayId && modalData.hourId;

    if (isCellMode) {
      const fetchInitialData = async () => {
        setIsInitialLoading(true);
        try {
          const promises = [];

          // Load groups
         // ...existing code...
if (!loadedData.groups) {
  promises.push(
    get(`/api/groups?faculty_id=${facultyId}`)
      .then(res => {
        setGroups(Array.isArray(res.data?.data) ? res.data.data : []);
        setLoadedData(prev => ({ ...prev, groups: true }));
      })
  );
}
// ...existing code...

          // Load hours
          if (!loadedData.hours) {
            promises.push(
              get('/api/hours')
                .then(res => {
                  setHours(res.data || []);
                  setLoadedData(prev => ({ ...prev, hours: true }));
                })
            );
          }

          // Load week types
          if (!loadedData.weekTypes) {
            promises.push(
              get('/api/week-types')
                .then(res => {
                  setWeekTypes(res.data || []);
                  setLoadedData(prev => ({ ...prev, weekTypes: true }));
                })
            );
          }

          // Load subjects for group
          if (modalData.groupId) {
            promises.push(
              get(`/api/groups/${modalData.groupId}/lectures`)
                .then(res => {
                  let subjectsData = [];
                  if (res.data && Array.isArray(res.data)) {
                    subjectsData = res.data;
                  } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                    subjectsData = res.data.data;
                  }
                  setSubjects(subjectsData);
                  setCurrentSubjectsGroupId(modalData.groupId.toString());
                  setLoadedData(prev => ({ ...prev, subjects: true }));
                })
                .catch(error => {
                  console.error('Error loading subjects:', error);
                  setSubjects([]);
                  setCurrentSubjectsGroupId(null);
                })
            );
          }

          await Promise.all(promises);
        } catch (error) {
          console.error('Data loading failed:', error);
          errorAlert('Xəta', 'Məlumatlar yüklənərkən xəta baş verdi');
        } finally {
          setIsInitialLoading(false);
        }
      };

      fetchInitialData();
    }
  }, [facultyId, isOpen, modalData]);

  // Loading functions
const loadGroups = async () => {
  if (loadedData.groups || loadingStates.groups) return;

  setLoadingStates(prev => ({ ...prev, groups: true }));
  try {
    const response = await get(`/api/groups?faculty_id=${facultyId}`);
    // Düzgün arrayı götür:
    setGroups(Array.isArray(response.data?.data) ? response.data.data : []);
    setLoadedData(prev => ({ ...prev, groups: true }));
  } catch (error) {
    console.error('Groups loading failed:', error);
    setGroups([]);
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
    const gid = groupId || (formData.group_id && formData.group_id.length > 0 ? formData.group_id[0] : null);

    if (!gid) {
      setSubjects([]);
      setCurrentSubjectsGroupId(null);
      return;
    }

    if (currentSubjectsGroupId === gid.toString() && !loadingStates.subjects) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, subjects: true }));

    try {
      const res = await get(`/api/groups/${gid}/lectures`);

      let subjectsData = [];
      if (res.data && Array.isArray(res.data)) {
        subjectsData = res.data;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        subjectsData = res.data.data;
      }

      setSubjects(subjectsData);
      setCurrentSubjectsGroupId(gid.toString());
      setLoadedData(prev => ({ ...prev, subjects: true }));
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
      setCurrentSubjectsGroupId(null);
    } finally {
      setLoadingStates(prev => ({ ...prev, subjects: false }));
    }
  };

  const loadLessonTypes = async (lessonId?: any) => {
    const lid = lessonId || formData.lesson_id;

    if (!lid) {
      setLessonTypes([]);
      setCurrentLessonTypesLessonId(null);
      return;
    }

    if (currentLessonTypesLessonId === lid.toString() && !loadingStates.lessonTypes) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, lessonTypes: true }));

    try {
      const res = await get(`/api/lessons/${lid}/lesson-types`);

      let lessonTypesData = [];
      if (res.data && Array.isArray(res.data)) {
        lessonTypesData = res.data;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        lessonTypesData = res.data.data;
      }

      setLessonTypes(lessonTypesData);
      setCurrentLessonTypesLessonId(lid.toString());
      setLoadedData(prev => ({ ...prev, lessonTypes: true }));
    } catch (error) {
      console.error('Error loading lesson types:', error);
      setLessonTypes([]);
      setCurrentLessonTypesLessonId(null);
    } finally {
      setLoadingStates(prev => ({ ...prev, lessonTypes: false }));
    }
  };

  const loadProfessorsByLessonType = async (lessonId: any, lessonTypeId: any) => {
    if (!lessonId || !lessonTypeId) {
      setProfessors([]);
      setCurrentProfessorsLessonTypeId(null);
      return;
    }

    const cacheKey = `${lessonId}_${lessonTypeId}`;

    if (currentProfessorsLessonTypeId === cacheKey && !loadingStates.lessonTypeProfessors) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, lessonTypeProfessors: true }));

    try {
      const response = await get(`/api/lessons/${lessonId}/professor/type/${lessonTypeId}`);

      let professorsData = [];
      if (response.data && Array.isArray(response.data)) {
        professorsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        professorsData = response.data.data;
      } else if (response.data && response.data.professor_id) {
        professorsData = [response.data];
      }

      setProfessors(professorsData);
      setCurrentProfessorsLessonTypeId(cacheKey);
      setLoadedData(prev => ({ ...prev, lessonTypeProfessors: true }));

      if (professorsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          teacher_code: professorsData[0].professor_id
        }));
      }
    } catch (error) {
      console.error('Error loading professors by lesson type:', error);
      setProfessors([]);
      setCurrentProfessorsLessonTypeId(null);
    } finally {
      setLoadingStates(prev => ({ ...prev, lessonTypeProfessors: false }));
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

  const loadRooms = async () => {
    // Bu şərtləri yenidən yoxlayıram, çünki artıq istifadəçinin seçimlərinə görə otaqlar gələcək.
    // Əgər həftə tipi, gün və saat seçilməyibsə, otaqları yükləməyin mənası yoxdur.
    if (!formData.week_type_id || !formData.day_id || !formData.hour_id) {
      setRooms([]);
      setLoadedData(prev => ({ ...prev, rooms: false }));
      return;
    }

    // Yükləməyə başlamaq üçün `loadingStates` state-ini yeniləyirəm.
    setLoadingStates(prev => ({ ...prev, rooms: true }));

    try {
      // Yuxarıda göstərdiyin endpoint formatını istifadə edirəm.
      const endpoint = `/api/rooms?week_type_id=${formData.week_type_id}&day_id=${formData.day_id}&hour_id=${formData.hour_id}`;
      const response = await get(endpoint);

      // API-dən gələn datanı yoxlayıram və `setRooms` ilə state-ə yazıram.
      if (response.data && Array.isArray(response.data)) {
        setRooms(response.data);
      } else {
        setRooms([]);
      }

      // Yüklənmə prosesinin bitdiyini qeyd edirəm.
      setLoadedData(prev => ({ ...prev, rooms: true }));
    } catch (error) {
      console.error('Otaqlar yüklənərkən xəta baş verdi:', error);
      setRooms([]);
    } finally {
      // Yükləməni bitirirəm, istənilən halda.
      setLoadingStates(prev => ({ ...prev, rooms: false }));
    }
  };

  // Handle field changes
  const handleFieldChange = (value: any, { name }: { name: string }) => {
    setFormData((prev: any) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };

      if (name === 'group_id' && value) {
        const groupId = Array.isArray(value) ? value[0] : value;
        if (groupId) {
          newFormData.lesson_id = '';
          setSubjects([]);
          setCurrentSubjectsGroupId(null);
          setLoadedData(prev => ({ ...prev, subjects: false }));
          loadSubjects(groupId);
        }
      }

      if (['week_type_id', 'day_id', 'hour_id'].includes(name)) {
        // Otaq seçimini sıfırla, çünki yeni vaxt üçün fərqli otaqlar gələcək.
        newFormData.room_id = '';
        // Əgər əvvəlki "rooms" datası yüklənmişdisə, yenidən yüklənmək üçün statusu "false" et.
        setLoadedData(prevLoaded => ({ ...prevLoaded, rooms: false }));
      }

      if (name === 'lesson_type_id' && value) {
        if (newFormData.lesson_id) {
          newFormData.teacher_code = '';
          setProfessors([]);
          setCurrentProfessorsLessonTypeId(null);
          setLoadedData(prev => ({ ...prev, lessonTypeProfessors: false }));
          loadProfessorsByLessonType(newFormData.lesson_id, value);
        }
      }

      if (name === 'lesson_id' && value) {
        if (newFormData.lesson_type_id) {
          newFormData.teacher_code = '';
          setProfessors([]);
          setCurrentProfessorsLessonTypeId(null);
          setLoadedData(prev => ({ ...prev, lessonTypeProfessors: false }));
          loadProfessorsByLessonType(value, newFormData.lesson_type_id);
        }
      }

      return newFormData;
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
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
      newErrors.lesson_id = 'Dərs seçilməlidir';
    }
    if (!formData.lesson_type_id) {
      newErrors.lesson_type_id = 'Dərs tipi seçilməlidir';
    }
    if (!formData.week_type_id) {
      newErrors.week_type_id = 'Həftə tipi seçilməlidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const groupId = Array.isArray(formData.group_id) ? formData.group_id[0] : formData.group_id;

      const postData: any = {
        faculty_id: facultyId,
        group_id: groupId,
        day_id: Number(formData.day_id),
        hour_id: Number(formData.hour_id),
        week_type_id: Number(formData.week_type_id),
        lesson_id: Number(formData.lesson_id),
        lesson_type_id: Number(formData.lesson_type_id),
        teacher_code: formData.teacher_code,
        ...(shareWithOthers && sharedGroups.length > 0
          ? { other_groups: sharedGroups }
          : {}),
      };

      // Əgər otaq seçilibsə və boş deyil, əlavə et
      if (formData.room_id && formData.room_id !== '') {
        postData.room_id = Number(formData.room_id);
      }

      const response = await post('/api/schedules', postData);

      successAlert('Uğurlu', 'Dərs uğurla əlavə olundu!');

      if (onSuccess) {
        onSuccess(
          groupId,
          Number(formData.day_id),
          Number(formData.hour_id),
          response.data
        );
      }
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

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
      <div className="text-center">
        <ClipLoader size={40} color="#6366f1" />
        <p className="mt-4 text-gray-600">Məlumatlar yüklənir...</p>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-9999 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100 relative"
      >
        {isInitialLoading && <LoadingOverlay />}

        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Yeni Dərs Əlavə Et
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

        {/* Form */}
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
    id: group.id,
    name: group.name,
  }))}
  required
  error={!!errors.group_id}
  placeholder="Qrup seçin"
  onOpen={!loadedData.groups ? loadGroups : undefined}
  isLoading={loadingStates.groups}
/>
                {errors.group_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.group_id}</p>
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
                  onOpen={!loadedData.hours ? loadHours : undefined}
                  isLoading={loadingStates.hours}
                />
                {errors.hour_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.hour_id}</p>
                )}
              </div>
            </div>

            {/* Dərs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dərs <span className="text-red-500">*</span>
              </label>
              <VirtualSelect
                value={formData.lesson_id}
                onChange={handleFieldChange}
                name="lesson_id"
                options={subjects.map((subject) => ({
                  id: subject.id,
                  name: subject.name + " - " + (subject.student_count + " tələbə"),
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
                <p className="mt-1 text-sm text-red-600">{errors.lesson_id}</p>
              )}
            </div>

            <div className="col-span-1 md:col-span-3">
              <label className="inline-flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={shareWithOthers}
                  onChange={async (e) => {
                    setShareWithOthers(e.target.checked);
                    if (e.target.checked && (!Array.isArray(sharedGroupsOptions) || sharedGroupsOptions.length === 0)) {
                      setSharedGroupsLoading(true);
                      try {
                        const res = await get(`/api/groups-all`);
                        // Həmişə array olduğuna əmin olun
                        const arr = res.data && Array.isArray(res.data.data) ? res.data.data : [];
                        setSharedGroupsOptions(arr);

                      } finally {
                        setSharedGroupsLoading(false);
                      }
                    }
                  }}
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-sm text-gray-700">Digər qruplarla paylaş</span>
              </label>
              {shareWithOthers && (
                <div className="mt-2">
                  <VirtualSelect
                    value={sharedGroups.map(Number)} // id-ləri number edin
                    onChange={(val) => setSharedGroups(val.map(Number))}
                    name="shared_groups"
                    options={
                      Array.isArray(sharedGroupsOptions)
                        ? sharedGroupsOptions
                          .filter(g => {
                            const mainIds = Array.isArray(formData.group_id)
                              ? formData.group_id.map(Number)
                              : [];
                            return !mainIds.includes(Number(g.id));
                          })
                          .map(g => ({
                            id: Number(g.id),
                            name: `${g.name} (${g.faculty.name})`
                          }))
                        : []
                    }
                    multiple
                    placeholder="Qrupları seçin"
                    isLoading={sharedGroupsLoading}
                  />
                </div>
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
                  <p className="mt-1 text-sm text-red-600">{errors.lesson_type_id}</p>
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
                  <p className="mt-1 text-sm text-red-600">{errors.week_type_id}</p>
                )}
              </div>
            </div>

            {/* Müəllim və Otaq */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Müəllim
                </label>
                {loadingStates.lessonTypeProfessors ? (
                  <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                    <span className="text-gray-500">Müəllim məlumatları yüklənir...</span>
                  </div>
                ) : professors.length > 0 ? (
                  <input
                    type="text"
                    value={`${professors[0].professor_name || ''} ${professors[0].professor_surname || ''}`.trim()}
                    readOnly
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-default"
                    placeholder="Müəllim"
                  />
                ) : (
                  <input
                    type="text"
                    value=""
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-default"
                    placeholder={
                      formData.lesson_id && formData.lesson_type_id
                        ? "Müəllim tapılmadı"
                        : "Əvvəl fənn və dərs tipi seçin"
                    }
                  />
                )}

              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Otaq
                </label>
                <VirtualSelect
                  value={formData.room_id}
                  onChange={handleFieldChange}
                  name="room_id"
                  options={[
                    { id: '', name: 'Secin' }, // "Secin" seçimi əlavə olundu
                    ...rooms.map((room) => {
                      if (room.conflict_info && room.conflict_info.length > 0) {
                        const conflictGroups = room.conflict_info.map(conflict => conflict.group).join(', ');
                        const prefix = `${room.corp_id}-${room.name} (${room.types}) Tutum: ${room.room_capacity} -`;
                        return {
                          id: room.id,
                          name: `${prefix} Doludur (${conflictGroups})`,
                          displayPrefix: prefix,
                          statusText: `Doludur (${conflictGroups})`,
                          isFull: true,
                        };
                      }
                      const prefix = `${room.corp_id}-${room.name} (${room.types}) Tutum: ${room.room_capacity} -`;
                      return {
                        id: room.id,
                        name: `${prefix} Boşdur`,
                        displayPrefix: prefix,
                        statusText: 'Boşdur',
                        isFull: false,
                      };
                    })
                  ]}
                  required={false}
                  error={!!errors.room_id}
                  placeholder={
                    (formData.week_type_id && formData.day_id && formData.hour_id)
                      ? (loadingStates.rooms ? "Otaqlar yüklənir..." : "Otaq seçin")
                      : "Əvvəl Həftə tipi, Gün və Saat seçin"
                  }
                  disabled={!formData.week_type_id || !formData.day_id || !formData.hour_id}
                  searchPlaceholder="Otaq axtarın..."
                  dropdownDirection="top"
                  onOpen={() => {
                    if (!loadedData.rooms) {
                      loadRooms();
                    }
                  }}
                  isLoading={loadingStates.rooms}
                />
                {errors.room_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.room_id}</p>
                )}
              </div>
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
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Əlavə et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonModal;