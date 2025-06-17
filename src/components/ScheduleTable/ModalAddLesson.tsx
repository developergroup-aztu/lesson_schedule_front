import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { dayNames, mockScheduleData } from '../../data/mockData';
import {
  ProfessorSelect,
  GroupSelect,
  RoomSelect,
  DisciplineSelect,
  DaySelect,
  VirtualSelect,
} from '../Select/ScheduleSelect';
import { post, get } from '../../api/service';

interface HeaderLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; 
}

interface Group {
  id: number;
  name: string;
}

const HeaderLessonModal: React.FC<HeaderLessonModalProps> = ({
  isOpen,
  onClose,
  onSuccess, 
}) => {
  const { user } = useAuth();
  const facultyId = user?.faculty_id;

  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    faculty_id: facultyId || '',
    group_ids: [] as number[],
    day_id: '',
    hour_id: '',
    subject_id: '',
    lesson_type_id: '',
    week_type_id: '',
    teacher_code: '',
    room_id: '',
  });

  const [hours, setHours] = useState<{ id: number; time: string }[]>([]);

  const fetchGroups = async () => {
    if (!facultyId) return;

    setIsLoading(true);
    try {
      const response = await get(`/api/groups?faculty_id=${facultyId}`);
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (facultyId) {
      fetchGroups();
    }
  }, [facultyId]);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const response = await get('/api/hours');
        setHours(response.data || []);
      } catch (error) {
        setHours([]);
      }
    };
    fetchHours();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        faculty_id: facultyId || '',
        group_ids: [],
        day_id: '',
        hour_id: '',
        subject_id: '',
        lesson_type_id: '',
        week_type_id: '',
        teacher_code: '',
        room_id: '',
      });
    }
  }, [isOpen, facultyId]);

  const handleFieldChange = (value: any, { name }: { name: string }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facultyId) {
      alert('Fakültə məlumatları tapılmadı!');
      return;
    }

    if (!formData.group_ids || (Array.isArray(formData.group_ids) && formData.group_ids.length === 0)) {
      alert('Ən azı bir qrup seçilməlidir!');
      return;
    }

    setIsLoading(true);
    try {
      const postData = {
        faculty_id: facultyId,
        group_ids: formData.group_ids,
        day_id: Number(formData.day_id),
        hour_id: Number(formData.hour_id),
        week_type_id: Number(formData.week_type_id),
        subject_id: Number(formData.subject_id),
        lesson_type_id: Number(formData.lesson_type_id),
        teacher_code: formData.teacher_code,
        room_id: Number(formData.room_id),
      };
      await post('/api/schedules', postData);
      onClose();
      if (onSuccess) onSuccess(); // əlavə et
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Xəta baş verdi! Yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Dərs əlavə et</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form
          id="header-lesson-form"
          onSubmit={handleSubmit}
          className="flex-1 p-6 overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Group Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qrup
              </label>
              <GroupSelect
                value={formData.group_ids}
                onChange={handleFieldChange}
                name="group_ids"
                required
                isMulti
                options={groups.map((group) => ({
                  value: group.id,
                  label: group.name,
                }))}
                placeholder={isLoading ? "Qruplar yüklənir..." : "Qrup seçin"}
                isDisabled={isLoading}
              />
            </div>

            {/* Day Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gün
              </label>
              <DaySelect
                value={formData.day_id}
                onChange={handleFieldChange}
                name="day_id"
                required
                options={dayNames.map((name, index) => ({
                  value: index + 1,
                  label: name,
                }))}
              />
            </div>

            {/* Hour Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saat
              </label>
              <VirtualSelect
                value={formData.hour_id}
                onChange={handleFieldChange}
                name="hour_id"
                options={hours.map((hour) => ({
                  value: hour.id,
                  label: hour.time,
                }))}
                placeholder="Saat seçin"
                required
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>

            {/* Subject Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fənn
              </label>
              <DisciplineSelect
                value={formData.subject_id}
                onChange={handleFieldChange}
                name="subject_id"
                required
                options={mockScheduleData.subjects.map((subject) => ({
                  value: subject.subject_id,
                  label: subject.subject_name,
                }))}
              />
            </div>

            {/* Lesson Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dərs tipi
              </label>
              <VirtualSelect
                value={formData.lesson_type_id}
                onChange={handleFieldChange}
                name="lesson_type_id"
                apiEndpoint="/api/lesson_types"
                labelKey="lesson_type"
                searchKeys={['lesson_type']}
                placeholder="Dərs tipi seçin"
                required
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>

            {/* Week Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Həftə tipi
              </label>
              <VirtualSelect
                value={formData.week_type_id}
                onChange={handleFieldChange}
                name="week_type_id"
                apiEndpoint="/api/week_types"
                labelKey="week_type"
                searchKeys={['week_type']}
                placeholder="Həftə tipi seçin"
                required
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>

            {/* Teacher Selection */}
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Müəllim
              </label>
              <ProfessorSelect
                value={formData.teacher_code}
                onChange={handleFieldChange}
                name="teacher_code"
                required
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>

            {/* Room Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Otaq
              </label>
              <RoomSelect
                value={formData.room_id}
                onChange={handleFieldChange}
                name="room_id"
                required
                options={mockScheduleData.rooms.map((room) => ({
                  value: room.room_id,
                  label: `${room.room_name} (${room.corp_name})`,
                }))}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 relative z-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Ləğv et
          </button>
          <button
            type="submit"
            form="header-lesson-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Əlavə edilir...' : 'Əlavə et'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderLessonModal;