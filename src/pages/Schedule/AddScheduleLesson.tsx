import { useState, useEffect } from 'react';
import { get, post, put } from '../../api/service';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  ProfessorSelect, 
  GroupSelect, 
  RoomSelect, 
  DisciplineSelect, 
  DaySelect,
  VirtualSelect
} from '../../components/Select/ScheduleSelect';

interface FormData {
  group_id: number[];
  day_id: number;
  hour_id: string;
  subject_id: string;
  lesson_type_id: string;
  week_type_id: string;
  teacher_id: string;
  room_id: string;
}

const AddScheduleLesson = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState<FormData>({
    group_id: [],
    day_id: '',
    hour_id: '',
    subject_id: '',
    lesson_type_id: '',
    week_type_id: '',
    teacher_id: '',
    room_id: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing schedule data if editing
  useEffect(() => {
    if (id) {
      const fetchScheduleData = async () => {
        try {
          const response = await get(`/api/schedules/${id}`);
          setFormData(response.data);
        } catch (error) {
          console.error('Error fetching schedule data:', error);
          Swal.fire({
            icon: 'error',
            title: 'Xəta',
            text: 'Məlumatlar yüklənərkən xəta baş verdi',
          });
        }
      };
      fetchScheduleData();
    }
  }, [id]);

  // Handle form field changes
  const handleFieldChange = (value: any, { name }: { name: string }) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.group_id || formData.group_id.length === 0) {
      errors.group_id = 'Qrup seçilməlidir';
    }
    if (!formData.day_id) {
      errors.day_id = 'Gün seçilməlidir';
    }
    if (!formData.hour_id) {
      errors.hour_id = 'Saat seçilməlidir';
    }
    if (!formData.subject_id) {
      errors.discipline_id = 'Fənn seçilməlidir';
    }
    if (!formData.lesson_type_id) {
      errors.lesson_type_id = 'Dərs tipi seçilməlidir';
    }
    if (!formData.week_type_id) {
      errors.week_type_id = 'Həftə tipi seçilməlidir';
    }
    // if (!formData.room_id) {
    //   errors.room_id = 'Otaq seçilməlidir';
    // }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Xəta',
        text: 'Zəhmət olmasa bütün sahələri doldurun',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (id) {
        await put(`/api/schedules/${id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Yeniləndi',
          text: 'Dərs uğurla yeniləndi',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await post('/api/schedules', formData);
        Swal.fire({
          icon: 'success',
          title: 'Əlavə edildi',
          text: 'Dərs uğurla əlavə edildi',
          timer: 2000,
          showConfirmButton: false
        });
      }
      navigate('/schedules');
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        // Validation errors from backend
        const backendErrors = error.response.data.errors;
        const errorMessages: Record<string, string> = {};
        
        Object.keys(backendErrors).forEach(key => {
          errorMessages[key] = Array.isArray(backendErrors[key]) 
            ? backendErrors[key][0] 
            : backendErrors[key];
        });
        
        setFormErrors(errorMessages);
        
        Swal.fire({
          icon: 'error',
          title: 'Validasiya xətası',
          text: 'Zəhmət olmasa formdakı xətaları düzəldin',
        });
      } else if (error.response?.data?.message) {
        Swal.fire({
          icon: 'error',
          title: 'Xəta',
          text: error.response.data.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Xəta',
          text: 'Dərs yadda saxlanılarkən xəta baş verdi',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {id ? 'Dərsi Redaktə Et' : 'Yeni Dərs Əlavə Et'}
            </h1>
            <p className="mt-2 text-gray-600">
              {id ? 'Mövcud dərsin məlumatlarını yeniləyin' : 'Dərs cədvəlinə yeni dərs əlavə edin'}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => navigate('/schedules')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            ← Geri qayıt
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Qrup */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Qrup <span className="text-red-500">*</span>
              </label>
              <GroupSelect
                value={formData.group_id}
                onChange={handleFieldChange}
                name="group_id"
                error={formErrors.group_id}
                
                required
              />
            </div>

            {/* Gün */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Gün <span className="text-red-500">*</span>
              </label>
              <DaySelect
                value={formData.day_id}
                onChange={handleFieldChange}
                name="day_id"
                error={formErrors.day_id}
                required
              />
            </div>

            {/* Saat */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Saat <span className="text-red-500">*</span>
              </label>
              <VirtualSelect
                value={formData.hour_id}
                onChange={handleFieldChange}
                name="hour_id"
                apiEndpoint="/api/hours"
                labelKey="time"
                searchKeys={['time']}
                placeholder="Saat seçin"
                searchPlaceholder="Saat axtarın..."
                noDataText="Saat tapılmadı"
                error={formErrors.hour_id}
                required
              />
            </div>

            {/* Fənn */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Fənn <span className="text-red-500">*</span>
              </label>
              <DisciplineSelect
                value={formData.subject_id}
                onChange={handleFieldChange}
                name="subject_id"
                error={formErrors.subject_id}
                required
              />
            </div>

            {/* Dərs Tipi */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Dərs Tipi <span className="text-red-500">*</span>
              </label>
              <VirtualSelect
                value={formData.lesson_type_id}
                onChange={handleFieldChange}
                name="lesson_type_id"
                apiEndpoint="/api/lesson_types"
                labelKey="lesson_type"
                searchKeys={['lesson_type']}
                placeholder="Dərs tipi seçin"
                searchPlaceholder="Dərs tipi axtarın..."
                noDataText="Dərs tipi tapılmadı"
                error={formErrors.lesson_type_id}
                required
              />
            </div>

            {/* Həftə Tipi */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Həftə Tipi <span className="text-red-500">*</span>
              </label>
              <VirtualSelect
                value={formData.week_type_id}
                onChange={handleFieldChange}
                name="week_type_id"
                apiEndpoint="/api/week_types"
                labelKey="week_type"
                searchKeys={['week_type']}
                placeholder="Həftə tipi seçin"
                searchPlaceholder="Həftə tipi axtarın..."
                noDataText="Həftə tipi tapılmadı"
                error={formErrors.week_type_id}
                required
              />
            </div>

            {/* Müəllim */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Müəllim <span className="text-red-500">*</span>
              </label>
              <ProfessorSelect
                value={formData.teacher_id}
                onChange={handleFieldChange}
                name="teacher_id"
                error={formErrors.teacher_id}
                required
              />
            </div>

            {/* Otaq */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Otaq <span className="text-red-500">*</span>
              </label>
              <RoomSelect
                value={formData.room_id}
                onChange={handleFieldChange}
                name="room_id"
                error={formErrors.room_id}
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/schedule')}
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ləğv et
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {id ? 'Yenilənir...' : 'Əlavə edilir...'}
                  </>
                ) : (
                  id ? 'Yenilə' : 'Əlavə et'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Məlumat</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Bütün sahələr mütləqdir və doldurulmalıdır</p>
              <p>• Qrup sahəsində birdən çox qrup seçə bilərsiniz</p>
              <p>• Axtarış sahəsindən istifadə edərək tez tapın</p>
              <p>• Keyboard navigation: ↑↓ hərəkət, Enter seçim, Esc bağla</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleLesson;