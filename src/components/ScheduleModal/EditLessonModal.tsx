import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';
import { useAuth } from '../../Context/AuthContext';
import { get, put } from '../../api/service';
import { useParams } from 'react-router-dom';
import useSweetAlert from '../../hooks/useSweetAlert';
import { ClipLoader } from 'react-spinners';
import VirtualSelect from '../Select/ScheduleSelect';
import "./EditLessonModal.css";

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: any;
  onSuccess?: () => void;
}

const EditLessonModal: React.FC<EditLessonModalProps> = ({
  isOpen,
  onClose,
  modalData,
  onSuccess = () => { },
}) => {
  const { scheduleData, refreshSchedule } = useSchedule();
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  const facultyId = (user as any)?.faculty_id || scheduleData.faculty?.faculty_id || params.id;
  const facultyName = (user as any)?.faculty_name || scheduleData.faculty?.faculty_name;
  const isFacultyAdmin = (user as any)?.roles?.includes('FacultyAdmin');
  const { successAlert, errorAlert } = useSweetAlert();
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
  const [scheduGroupleId, setScheduleGroupId] = useState<number | null>(null);

  const [loadingStates, setLoadingStates] = useState({
    subjects: false,
    lessonTypes: false,
    professors: false,
    rooms: false,
    hours: false,
    weekTypes: false,
  });

  // Dedupe concurrent room requests (prevents double fetch + false error alert)
  const roomsRequestRef = useRef<{ key: string; inFlight: boolean }>({ key: '', inFlight: false });

  const [formData, setFormData] = useState<any>({
    group_id: [],
    day_id: '',
    hour_id: '',
    lesson_id: '',
    lesson_type_id: '',
    week_type_id: '',
    teacher_code: '',
    room_id: '',
  });

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

  useEffect(() => {
    if (!isOpen) {
      setGroups([]);
      setHours([]);
      setSubjects([]);
      setRooms([]);
      setLessonTypes([]);
      setWeekTypes([]);
      setProfessors([]);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !modalData.schedule_group_id) {
      console.log('EditLessonModal - Fetching prevented:', {
        isOpen,
        schedule_group_id: modalData.schedule_group_id,
        modalData
      });
      return;
    }

    console.log('EditLessonModal - Fetching schedule:', modalData.schedule_group_id);

    const fetchSchedule = async () => {
      setIsInitialLoading(true);
      try {
        const res = await get(`/api/schedules/${modalData.schedule_group_id}`);
        const schedule = res.data?.schedule;
        if (!schedule) return;

        setScheduleGroupId(schedule.schedule_group_id);

        const initialFormData = {
          group_id: [schedule.group_id],
          day_id: schedule.day_id,
          hour_id: schedule.hour_id,
          lesson_id: schedule.lesson_id,
          lesson_type_id: schedule.lesson_type_id,
          week_type_id: schedule.week_type_id,
          teacher_code: schedule.teacher_code,
          room_id: schedule.room_id,
        };

        setFormData(initialFormData);

        setGroups([{ id: schedule.group_id, name: schedule.group_name }]);
        setHours([{ id: schedule.hour_id, name: schedule.hour_name }]);
        setWeekTypes([{ id: schedule.week_type_id, name: schedule.week_type_name }]);
        setSubjects([{ id: schedule.lesson_id, name: schedule.lesson_name }]);
        setLessonTypes([{ id: schedule.lesson_type_id, name: schedule.lesson_type_name }]);
        setProfessors([{
          professor_id: schedule.teacher_code,
          professor_name: schedule.teacher_name,
          professor_surname: schedule.teacher_surname,
        }]);
        setRooms([{
          id: schedule.room_id,
          name: schedule.room_name,
          corp_id: schedule.corp_id,
          room_capacity: schedule.room_capacity,
          types: schedule.room_types,
        }]);

        if (!isFacultyAdmin) {
          await loadRooms(initialFormData.day_id, initialFormData.hour_id, initialFormData.week_type_id);
        }

      } catch (error) {
        errorAlert('Xəta', 'Cədvəl məlumatı yüklənmədi');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchSchedule();
  }, [isOpen, modalData.schedule_group_id]);

  useEffect(() => {
    if (!isFacultyAdmin && formData.day_id && formData.hour_id && formData.week_type_id) {
      loadRooms(formData.day_id, formData.hour_id, formData.week_type_id);
    }
  }, [formData.day_id, formData.hour_id, formData.week_type_id, isFacultyAdmin]);


  const loadSubjects = async () => {
    if (!formData.group_id?.[0]) return;
    if (subjects.length > 1) return;
    setLoadingStates(prev => ({ ...prev, subjects: true }));
    try {
      const res = await get(`/api/groups/${formData.group_id[0]}/lectures`);
      setSubjects(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setSubjects([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, subjects: false }));
    }
  };

  const loadHours = async () => {
    if (hours.length > 1) return;
    setLoadingStates(prev => ({ ...prev, hours: true }));
    try {
      const res = await get('/api/hours');
      setHours(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHours([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, hours: false }));
    }
  };

  const loadLessonTypes = async () => {
    if (!formData.lesson_id) return;
    setLoadingStates(prev => ({ ...prev, lessonTypes: true }));
    try {
      const res = await get(`/api/lessons/${formData.lesson_id}/lesson-types`);
      setLessonTypes(res.data || []);
    } catch {
      setLessonTypes([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, lessonTypes: false }));
    }
  };

  const loadProfessorsByLessonType = async (lessonId: any, lessonTypeId: any) => {
    if (!lessonId || !lessonTypeId) return;
    setLoadingStates(prev => ({ ...prev, professors: true }));
    try {
      const res = await get(`/api/lessons/${lessonId}/professor/type/${lessonTypeId}`);
      let profArr = Array.isArray(res.data) ? res.data : res.data && res.data.professor_id ? [res.data] : [];
      setProfessors(profArr);
      setFormData((prev: any) => ({
        ...prev,
        teacher_code: profArr[0]?.professor_id || ''
      }));
    } catch {
      setProfessors([]);
      setFormData((prev: any) => ({
        ...prev,
        teacher_code: ''
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, professors: false }));
    }
  };

  const loadRooms = async (day_id: number, hour_id: number, week_type_id: number) => {
    if (!day_id || !hour_id || !week_type_id) {
      setRooms([]);
      return;
    }

    const reqKey = `${facultyId}|${day_id}|${hour_id}|${week_type_id}`;
    if (roomsRequestRef.current.inFlight && roomsRequestRef.current.key === reqKey) {
      return;
    }
    roomsRequestRef.current = { key: reqKey, inFlight: true };

    setLoadingStates(prev => ({ ...prev, rooms: true }));
    try {
      const res = await get(`/api/rooms?day_id=${day_id}&hour_id=${hour_id}&week_type_id=${week_type_id}&faculty_id=${facultyId}`);
      const roomsArr =
        Array.isArray(res.data) ? res.data :
          Array.isArray((res.data as any)?.data) ? (res.data as any).data :
            [];

      setRooms(roomsArr);

      const isCurrentRoomAvailable = roomsArr.some((room: any) => room.id === formData.room_id);
      if (!isCurrentRoomAvailable && formData.room_id) {
        setErrors(prev => ({ ...prev, room_id: 'Seçilmiş otaq bu vaxt üçün uyğun deyil. Yeni otaq seçin.' }));
      }
    } catch (error) {
      // If we already have rooms on screen, don't show a misleading "failed to load" alert.
      setRooms(prev => (Array.isArray(prev) && prev.length > 0 ? prev : []));
      if (!(Array.isArray(rooms) && rooms.length > 0)) {
        errorAlert('Xəta', 'Otaq siyahısı yüklənmədi. Zəhmət olmasa yenidən cəhd edin.');
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, rooms: false }));
      roomsRequestRef.current.inFlight = false;
    }
  };

  const loadWeekTypes = async () => {
    if (weekTypes.length > 1) return;
    setLoadingStates(prev => ({ ...prev, weekTypes: true }));
    try {
      const res = await get('/api/week-types');
      setWeekTypes(Array.isArray(res.data) ? res.data : []);
    } catch {
      setWeekTypes([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, weekTypes: false }));
    }
  };

  const handleFieldChange = (value: any, { name }: { name: string }) => {
    setFormData((prev: any) => {
      let newFormData = {
        ...prev,
        [name]: value,
      };

      if (name === 'lesson_id') {
        newFormData.lesson_type_id = '';
        newFormData.teacher_code = '';
        setLessonTypes([]);
        setProfessors([]);
      }

      if (name === 'lesson_type_id') {
        newFormData.teacher_code = '';
        setProfessors([]);
        if (newFormData.lesson_id && value) {
          loadProfessorsByLessonType(newFormData.lesson_id, value);
        }
      }

      // Otaq seçimini sıfırlamayın, mövcud seçimi saxlayın
      return newFormData;
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

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
    const groupIds = Array.isArray(formData.group_id) ? formData.group_id : [formData.group_id];

    const postData: any = {
      faculty_id: facultyId,
      group_id: groupIds[0],
      day_id: Number(formData.day_id),
      hour_id: Number(formData.hour_id),
      week_type_id: Number(formData.week_type_id),
      lesson_id: Number(formData.lesson_id),
      lesson_type_id: Number(formData.lesson_type_id),
      teacher_code: formData.teacher_code,
      schedule_group_id: modalData.schedule_group_id,
    };

    // Əgər otaq seçilibsə, əlavə et
    if (formData.room_id) {
      postData.room_id = Number(formData.room_id);
    }

    await put(`/api/schedules/${scheduGroupleId}`, postData);
    successAlert('Uğurlu', 'Dərs uğurla yeniləndi!');
    await refreshSchedule();
    onClose();
    if (onSuccess) onSuccess();
  } catch (error: any) {
    // Əlavə et: 409 və ya digər error mesajını göstər
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
    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-9999">
      <div className="text-center">
        <ClipLoader size={40} color="#3949AB" />
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

        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Dərsi Redaktə Et
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qrup <span className="text-red-500">*</span>
                </label>
                <VirtualSelect
                  value={formData.group_id && formData.group_id.length > 0 ? formData.group_id[0] : ''}
                  onChange={() => { }}
                  name="group_id"
                  options={groups.map((group) => ({
                    id: group.id || group.group_id,
                    name: group.name || group.group_name,
                  }))}
                  required
                  error={!!errors.group_id}
                  placeholder="Qrup seçin"
                  disabled={true}
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
                    name: hour.name || hour.time,
                  }))}
                  required
                  error={!!errors.hour_id}
                  placeholder="Saat seçin"
                  onOpen={loadHours}
                  isLoading={loadingStates.hours}
                />
                {errors.hour_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.hour_id}</p>
                )}
              </div>
            </div>

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
                  name: subject.name,
                }))}
                required
                error={!!errors.lesson_id}
                placeholder="Fənn seçin"
                onOpen={loadSubjects}
                isLoading={loadingStates.subjects}
              />
              {errors.lesson_id && (
                <p className="mt-1 text-sm text-red-600">{errors.lesson_id}</p>
              )}
            </div>

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
                  onOpen={() => loadLessonTypes()}
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

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Müəllim
                </label>
        <VirtualSelect
  value={formData.teacher_code}
  onChange={handleFieldChange}
  name="teacher_code"
  disabled
  options={professors.map((professor) => ({
    id: professor.professor_id,
    name: `${professor.professor_name || ''} ${professor.professor_surname || ''}`.trim(),
  }))}
  required
  error={!!errors.teacher_code}
  placeholder={
    formData.lesson_id && formData.lesson_type_id
      ? professors.length === 0
        ? "Müəllim tapılmadı"
        : "Müəllim seçin"
      : "Əvvəl fənn və dərs tipi seçin"
  }
  onOpen={() => {
    if (formData.lesson_id && formData.lesson_type_id) {
      loadProfessorsByLessonType(formData.lesson_id, formData.lesson_type_id);
    }
  }}
  isLoading={loadingStates.professors}
/>

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
          const conflictGroups = room.conflict_info.map((conflict: any) => conflict.group).join(', ');
          const prefix = `${room.corp_id}-${room.name} (${room.types}) Tutum: ${room.room_capacity} -`;
          return { id: room.id, name: `${prefix} Doludur (${conflictGroups})`, displayPrefix: prefix, statusText: `Doludur (${conflictGroups})`, isFull: true };
        }
        const prefix = `${room.corp_id}-${room.name} (${room.types}) Tutum: ${room.room_capacity} -`;
        return { id: room.id, name: `${prefix} Boşdur`, displayPrefix: prefix, statusText: 'Boşdur', isFull: false };
      })
    ]}
    required={false}
    error={!!errors.room_id}
    placeholder="Otaq seçin"
    searchPlaceholder="Otaq axtarın..."
    dropdownDirection="top"
    onOpen={() => {
      if (formData.day_id && formData.hour_id && formData.week_type_id) {
        loadRooms(formData.day_id, formData.hour_id, formData.week_type_id);
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
              Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLessonModal;