import React, { useState, useEffect } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { Lesson, Room, Teacher, Subject, ModalData } from '../types';
import { X } from 'lucide-react';
import { dayNames } from '../data/mockData';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: ModalData;
}

const LessonModal: React.FC<LessonModalProps> = ({ isOpen, onClose, modalData }) => {
  const { scheduleData, addLesson, editLesson } = useSchedule();
  
  // Initial form state
  const initialFormState = {
    subject_id: 0,
    subject_name: '',
    lesson_type_id: 1,
    teacher: {
      code: '',
      name: '',
      surname: ''
    },
    room: {
      room_id: 0,
      room_name: ''
    },
    week_type_id: 1,
    blocked: false
  };
  
  const [formData, setFormData] = useState<Lesson>(initialFormState);
  const [teacherName, setTeacherName] = useState('');
  const [teacherSurname, setTeacherSurname] = useState('');
  
  // Populate form with data when editing
  useEffect(() => {
    if (modalData.lesson) {
      setFormData(modalData.lesson);
      setTeacherName(modalData.lesson.teacher.name);
      setTeacherSurname(modalData.lesson.teacher.surname);
    } else {
      // Set default values for a new lesson
      setFormData({
        ...initialFormState,
        week_type_id: modalData.mode === 'add' ? modalData.lessonIndex || 1 : 1,
      });
      setTeacherName('');
      setTeacherSurname('');
    }
  }, [modalData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle select change for objects like subject, room
    if (name === 'subject_id') {
      const subject = scheduleData.subjects.find(s => s.subject_id === parseInt(value));
      if (subject) {
        setFormData({
          ...formData,
          subject_id: subject.subject_id,
          subject_name: subject.subject_name
        });
      }
    } else if (name === 'room_id') {
      const room = scheduleData.rooms.find(r => r.room_id === parseInt(value));
      if (room) {
        setFormData({
          ...formData,
          room: room
        });
      }
    } else if (name === 'teacher_name') {
      setTeacherName(value);
    } else if (name === 'teacher_surname') {
      setTeacherSurname(value);
    } else {
      setFormData({
        ...formData,
        [name]: name === 'lesson_type_id' || name === 'week_type_id' 
          ? parseInt(value) 
          : value
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update teacher info
    const updatedLesson: Lesson = {
      ...formData,
      teacher: {
        ...formData.teacher,
        name: teacherName,
        surname: teacherSurname
      }
    };
    
    if (modalData.mode === 'add' && modalData.groupId !== null && 
        modalData.dayId !== null && modalData.hourId !== null) {
      addLesson(modalData.groupId, modalData.dayId, modalData.hourId, updatedLesson);
    } else if (modalData.mode === 'edit' && modalData.groupId !== null && 
              modalData.dayId !== null && modalData.hourId !== null && 
              modalData.lessonIndex !== null) {
      editLesson(
        modalData.groupId, 
        modalData.dayId, 
        modalData.hourId, 
        modalData.lessonIndex, 
        updatedLesson
      );
    }
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
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
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qrup
              </label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                disabled
              >
                <option>
                  {scheduleData.faculty.groups.find(g => g.group_id === modalData.groupId)?.group_name || ''}
                </option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gün
              </label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                disabled
              >
                <option>
                  {modalData.dayId ? dayNames[modalData.dayId - 1] : ''}
                </option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saat
              </label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                disabled
              >
                <option>
                  {scheduleData.hours.find(h => h.id === modalData.hourId)?.time || ''}
                </option>
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fənn adı
              </label>
              <select 
                name="subject_id"
                value={formData.subject_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Fənn seçin</option>
                {scheduleData.subjects.map(subject => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dərs tipi
              </label>
              <select 
                name="lesson_type_id"
                value={formData.lesson_type_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {scheduleData.lesson_types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Həftə tipi
              </label>
              <select 
                name="week_type_id"
                value={formData.week_type_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {scheduleData.week_types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Müəllim adı
              </label>
              <input 
                type="text"
                name="teacher_name"
                value={teacherName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Müəllim soyadı
              </label>
              <input 
                type="text"
                name="teacher_surname"
                value={teacherSurname}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Otaq
              </label>
              <select 
                name="room_id"
                value={formData.room.room_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Otaq seçin</option>
                {scheduleData.rooms.map(room => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.room_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {modalData.mode === 'add' ? 'Əlavə et' : 'Yadda saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonModal;