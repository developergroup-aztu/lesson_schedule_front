import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { Lesson, ModalData } from '../types/Schedule';
import { dayNames, mockScheduleData } from '../data/mockData';
import {
  ProfessorSelect,
  GroupSelect,
  RoomSelect,
  DisciplineSelect,
  DaySelect,
  VirtualSelect
} from './Select/ScheduleSelect';
import { post } from '../api/service';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: ModalData;
}

const LessonModal: React.FC<LessonModalProps> = ({ isOpen, onClose, modalData }) => {
  const { scheduleData, addLesson, editLesson } = useSchedule();

  // Form state
  const [formData, setFormData] = useState<any>({
    group_id: modalData.groupId ? [modalData.groupId] : [],
    day_id: modalData.dayId || '',
    hour_id: modalData.hourId || '',
    subject_id: '',
    lesson_type_id: '',
    week_type_id: '',
    teacher_id: '',
    room_id: '',
  });

  // Populate form with data when editing
  useEffect(() => {
    if (modalData.lesson) {
      setFormData({
        group_id: [modalData.groupId],
        day_id: modalData.dayId,
        hour_id: modalData.hourId,
        subject_id: modalData.lesson.subject_id,
        lesson_type_id: modalData.lesson.lesson_type_id,
        week_type_id: modalData.lesson.week_type_id,
        teacher_id: modalData.lesson.teacher?.user_id || '',
        room_id: modalData.lesson.room?.room_id || '',
      });
    } else {
      setFormData({
        group_id: modalData.groupId ? [modalData.groupId] : [],
        day_id: modalData.dayId || '',
        hour_id: modalData.hourId || '',
        subject_id: '',
        lesson_type_id: '',
        week_type_id: '',
        teacher_id: '',
        room_id: '',
      });
    }
  }, [modalData]);

  // Handle field changes
  const handleFieldChange = (value: any, { name }: { name: string }) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const groupId = Array.isArray(formData.group_id) ? formData.group_id[0] : formData.group_id;
    const postData = {
      faculty_id: scheduleData.faculty.faculty_id,
      group_id: groupId,
      day_id: Number(formData.day_id),
      hour_id: Number(formData.hour_id),
      week_type_id: Number(formData.week_type_id),
      subject_id: Number(formData.subject_id),
      lesson_type_id: Number(formData.lesson_type_id),
      teacher_id: formData.teacher_id,
      room_id: Number(formData.room_id),
    };

    try {
      await post('/api/schedules', postData);
      onClose();
    } catch (err) {
      alert('Xəta baş verdi!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {modalData.mode === 'add' ? 'Dərs əlavə et' : 'Dərsi redaktə et'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form id="form" onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Qrup</label>
              <GroupSelect
                value={formData.group_id}
                onChange={handleFieldChange}
                name="group_id"
                required
                disabled
                options={mockScheduleData.groups.map(group => ({
                  value: group.group_id,
                  label: group.group_name,
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gün</label>
              <DaySelect
                value={formData.day_id}
                onChange={handleFieldChange}
                name="day_id"
                required
                disabled
                options={dayNames.map((name, index) => ({
                  value: index + 1,
                  label: name,
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
              <VirtualSelect
                value={formData.hour_id}
                onChange={handleFieldChange}
                name="hour_id"
                options={mockScheduleData.hours.map(hour => ({
                  value: hour.id,
                  label: hour.time,
                }))}
                placeholder="Saat seçin"
                required
                disabled
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fənn</label>
              <DisciplineSelect
                value={formData.subject_id}
                onChange={handleFieldChange}
                name="subject_id"
                required
                options={mockScheduleData.subjects.map(subject => ({
                  value: subject.subject_id,
                  label: subject.subject_name,
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dərs tipi</label>
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
                styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Həftə tipi</label>
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
                styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-700 mb-1">Müəllim</label>
              <ProfessorSelect
                value={formData.teacher_id}
                onChange={handleFieldChange}
                name="teacher_id"
                required
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Otaq</label>
              <RoomSelect
                value={formData.room_id}
                onChange={handleFieldChange}
                name="room_id"
                required
                options={mockScheduleData.rooms.map(room => ({
                  value: room.room_id,
                  label: `${room.room_name} (${room.corp_name})`,
                }))}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
          </div>
        </form>

        {/* Buttons */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 relative z-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            Ləğv et
          </button>
          <button
            type="submit"
            form="form"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {modalData.mode === 'add' ? 'Əlavə et' : 'Yadda saxla'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;