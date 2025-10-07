import React, { useState, useEffect } from 'react';
import VirtualSelect from '../../Select/ScheduleSelect';
import { get, post } from '../../../api/service';
import { useAuth } from '../../../Context/AuthContext';
import useSweetAlert from '../../../hooks/useSweetAlert';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MergeModal: React.FC<MergeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [groupOptions, setGroupOptions] = useState<any[]>([]);
  const [lectureOptions, setLectureOptions] = useState<any[]>([]);
  const [lessonTypeOptions, setLessonTypeOptions] = useState<any[]>([]);
  const [otherGroupOptions, setOtherGroupOptions] = useState<any[]>([]);

  const { successAlert, errorAlert } = useSweetAlert();

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [selectedLessonType, setSelectedLessonType] = useState<any>(null);
  const [selectedOtherGroup, setSelectedOtherGroup] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [loadingLessonTypes, setLoadingLessonTypes] = useState(false);
  const [loadingOtherGroups, setLoadingOtherGroups] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();

  // Qrupları yüklə (yalnız kliklənəndə çağırılacaq)
  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const grupApi =
        user?.roles.includes('admin') || user?.roles.includes('SuperAdmin')
          ? '/api/groups-all'
          : `/api/groups?faculty_id=${user?.faculty_id}`;
      const res = await get(`${grupApi}`);
      const groupsData = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const formattedGroups = groupsData.map((group) => {
        const facultyName = group.faculty?.name;
        const nameWithFaculty = facultyName ? `${group.name} (${facultyName})` : group.name;
        return { ...group, name: nameWithFaculty };
      });

      setGroupOptions(formattedGroups);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Qrupa görə dərsləri yüklə
  const fetchLecturesByGroup = async (groupId: any) => {
    setLoadingLectures(true);
    try {
      const res = await get(`/api/groups/${groupId}/lectures`);
      setLectureOptions(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } finally {
      setLoadingLectures(false);
    }
  };

  // Dərsə görə dərs tiplərini yüklə
  const fetchLessonTypes = async (lessonId: any) => {
    setLoadingLessonTypes(true);
    try {
      const res = await get(`/api/lessons/${lessonId}/lesson-types`);
      setLessonTypeOptions(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } finally {
      setLoadingLessonTypes(false);
    }
  };

  // Digər qrupları yüklə
  const fetchOtherGroups = async (lessonId: any, lessonTypeId: any) => {
    setLoadingOtherGroups(true);
    try {
      const res = await get(`/api/lessons/${lessonId}/groups?lesson_type_id=${lessonTypeId}`);
      setOtherGroupOptions(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } finally {
      setLoadingOtherGroups(false);
    }
  };

  // Modal açıldıqda hər şeyi sıfırla (amma qrupları avtomatik yükləmə)
  useEffect(() => {
    if (isOpen) {
      setSelectedGroup(null);
      setSelectedLecture(null);
      setSelectedLessonType(null);
      setSelectedOtherGroup([]);
      setLectureOptions([]);
      setLessonTypeOptions([]);
      setOtherGroupOptions([]);
      setGroupOptions([]); // köhnə datanı təmizlə
    }
  }, [isOpen]);

  // Qrup seçiləndə dərsləri yüklə
  useEffect(() => {
    if (selectedGroup) {
      setSelectedLecture(null);
      setSelectedLessonType(null);
      setSelectedOtherGroup([]);
      setLectureOptions([]);
      setLessonTypeOptions([]);
      setOtherGroupOptions([]);
      fetchLecturesByGroup(selectedGroup);
    } else {
      setLectureOptions([]);
      setLessonTypeOptions([]);
      setOtherGroupOptions([]);
      setSelectedLecture(null);
      setSelectedLessonType(null);
      setSelectedOtherGroup([]);
    }
  }, [selectedGroup]);

  // Dərs seçiləndə dərs tiplərini yüklə
  useEffect(() => {
    if (selectedLecture) {
      setSelectedLessonType(null);
      setSelectedOtherGroup([]);
      setLessonTypeOptions([]);
      setOtherGroupOptions([]);
      fetchLessonTypes(selectedLecture);
    } else {
      setLessonTypeOptions([]);
      setOtherGroupOptions([]);
      setSelectedLessonType(null);
      setSelectedOtherGroup([]);
    }
  }, [selectedLecture]);

  // Dərs tipi seçiləndə digər qrupları yüklə
  useEffect(() => {
    if (selectedLecture && selectedLessonType) {
      setSelectedOtherGroup([]);
      setOtherGroupOptions([]);
      fetchOtherGroups(selectedLecture, selectedLessonType);
    } else {
      setOtherGroupOptions([]);
      setSelectedOtherGroup([]);
    }
  }, [selectedLecture, selectedLessonType]);

  // POST
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedGroup ||
      !selectedLecture ||
      !selectedLessonType ||
      !selectedOtherGroup ||
      selectedOtherGroup.length === 0
    )
      return;

    setSubmitting(true);
    try {
      const selectedLectureObj = lectureOptions.find(
        (item) => item.id === selectedLecture || item.lesson_id === selectedLecture
      );
      const lecture_id = selectedLectureObj?.lecture_id;

      const otherGroupIds = selectedOtherGroup
        .map((selectedId: any) => {
          const obj = otherGroupOptions.find((item) => item.id === selectedId);
          return obj?.group_id;
        })
        .filter(Boolean);

      const group_ids = [selectedGroup, ...otherGroupIds];

      await post('/api/merges', {
        lecture_id,
        lesson_type_id: selectedLessonType,
        group_ids,
        semester_id: 20252,
      });

      successAlert('Uğurlu', 'Birləşmə uğurla əlavə olundu!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      let message = 'Xəta baş verdi! Zəhmət olmasa yenidən cəhd edin.';
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      errorAlert('Xəta', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-9999">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <span className="sr-only">Bağla</span>×
        </button>

        <h2 className="text-lg font-semibold mb-6 text-slate-800 m-0">Birləşmə əlavə et</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Qrup seçimi */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Qrup seçin</label>
          <VirtualSelect
  name="group"
  value={selectedGroup}
  onChange={(val) => setSelectedGroup(val)}
  options={groupOptions}
  labelKey="name"
  placeholder="Qrup seçin"
  isLoading={loadingGroups}
  required
  onOpen={() => {
    if (groupOptions.length === 0 && !loadingGroups) fetchGroups();
  }}
/>

          </div>

          {/* Dərs seçimi */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Dərs seçin</label>
            <VirtualSelect
              name="lecture"
              value={selectedLecture}
              onChange={(val) => setSelectedLecture(val)}
              options={lectureOptions}
              labelKey="name"
              placeholder="Dərs seçin"
              isLoading={loadingLectures}
              required
              disabled={!selectedGroup}
            />
          </div>

          {/* Dərs tipi seçimi */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Dərs tipi</label>
            <VirtualSelect
              name="lesson_type"
              value={selectedLessonType}
              onChange={(val) => setSelectedLessonType(val)}
              options={lessonTypeOptions}
              labelKey="lesson_type"
              placeholder="Dərs tipi seçin"
              isLoading={loadingLessonTypes}
              required
              disabled={!selectedLecture}
            />
          </div>

          {/* Digər qrup seçimi */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Digər qrup</label>
            <VirtualSelect
              name="other_group"
              value={selectedOtherGroup}
              onChange={(val) => setSelectedOtherGroup(val)}
              options={otherGroupOptions}
              labelKey="group_name"
              placeholder="Digər qrup seçin"
              isLoading={loadingOtherGroups}
              required
              disabled={!selectedLessonType}
              multiple
            />
          </div>

          {/* Submit düyməsi */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg transition"
            disabled={
              submitting ||
              !selectedGroup ||
              !selectedLecture ||
              !selectedLessonType ||
              !selectedOtherGroup
            }
          >
            {submitting ? 'Yüklənir...' : 'Yadda saxla'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MergeModal;
