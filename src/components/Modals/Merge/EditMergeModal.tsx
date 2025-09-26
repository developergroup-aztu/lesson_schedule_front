import React, { useState, useEffect } from 'react';
import VirtualSelect from '../../Select/ScheduleSelect';
import { get, put } from '../../../api/service';
import { useAuth } from '../../../Context/AuthContext';
import useSweetAlert from '../../../hooks/useSweetAlert';

interface MergeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mergeId: number | null;
}

const MergeEditModal: React.FC<MergeEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mergeId,
}) => {
  const [groupOptions, setGroupOptions] = useState<any[]>([]);
  const [lectureOptions, setLectureOptions] = useState<any[]>([]);
  const [lessonTypeOptions, setLessonTypeOptions] = useState<any[]>([]);
  const [otherGroupOptions, setOtherGroupOptions] = useState<any[]>([]);

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [mergeData, setMergeData] = useState<any | null>(null);

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
  const [isManualChange, setIsManualChange] = useState(false);

  const { user } = useAuth();


  const preSelectedGroups = mergeData?.groups?.map((g: any) => g.group_id) || [];


  // Helper function - ID-ləri normalize et (VirtualSelect ilə uyğun)
  const normalizeId = (obj: any) => {
    return obj?.id || obj?.value || obj?.lecture_id || obj?.lesson_type_id || obj?.group_id;
  };

  // Helper function - ID tapma
  const findById = (array: any[], targetId: any) => {
    return array.find(item => {
      const itemId = normalizeId(item);
      return String(itemId) === String(targetId);
    });
  };

  // Helper function - options-u VirtualSelect üçün normalize et
  const normalizeOptions = (options: any[], idField?: string) => {
    return options.map((option: any) => ({
      ...option,
      // IMPORTANT: Prefer explicit id field (e.g., group_id) so values align
      id: (idField ? option[idField] : undefined) ?? option[idField || 'id'] ?? option.group_id ?? option.id ?? option.value,
      name: option.group_name || option.name, // group_name sahəsini doldur
    }));
  };




  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const grupApi =
        user?.roles.includes('admin') || user?.roles.includes('SuperAdmin')
          ? '/api/groups-all'
          : `/api/groups?faculty_id=${user?.faculty_id}`;
      const res = await get(`${grupApi}`);
      const groupsData = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const formattedGroups = groupsData.map((group: any) => {
        const facultyName = group.faculty?.name;
        const nameWithFaculty = facultyName ? `${group.name} (${facultyName})` : group.name;

        return {
          ...group,
          name: nameWithFaculty
        };
      });

      return formattedGroups;
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchLecturesByGroup = async (groupId: any) => {
    if (!groupId) return [];
    setLoadingLectures(true);
    try {
      const res = await get(`/api/groups/${groupId}/lectures`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    } finally {
      setLoadingLectures(false);
    }
  };

  const fetchLessonTypes = async (lessonId: any) => {
    if (!lessonId) return [];
    setLoadingLessonTypes(true);
    try {
      const res = await get(`/api/lessons/${lessonId}/lesson-types`);
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    } finally {
      setLoadingLessonTypes(false);
    }
  };

  const fetchOtherGroups = async (lessonId: any, lessonTypeId: any) => {
    if (!lessonId || !lessonTypeId) return [];
    setLoadingOtherGroups(true);
    try {
      const res = await get(`/api/lessons/${lessonId}/groups?lesson_type_id=${lessonTypeId}`);
      const fetchedGroups = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Merge-dən gələn qrupların (ilkini çıxmaq şərti ilə) adlarını çıxart
      const excludedByName: string[] = Array.isArray(mergeData?.groups)
        ? mergeData!.groups.slice(1).map((g: any) => g.group_name)
        : [];

      // group_name ilə filter et (məs: 642a3, 642a1 çıxacaq)
      const filteredByName = fetchedGroups.filter((g: any) => !excludedByName.includes(g.group_name));

      // Əvvəlcədən seçilmiş qrupları saxlayın və id-yə görə dedup edin
      const normalizedFetchedGroups = normalizeOptions(filteredByName, 'group_id');
      const existingSelected = otherGroupOptions.filter((option) => selectedOtherGroup.includes(option.id));
      const combined = [...normalizedFetchedGroups, ...existingSelected];
      const uniqueById = Array.from(new Map(combined.map(item => [String(item.id), item])).values());

      return uniqueById;
    } finally {
      setLoadingOtherGroups(false);
    }
  };

  // Mövcud merge məlumatını yüklə və selectləri doldur
  const fetchMergeData = async () => {
    if (!mergeId) return;

    try {
      // Merge data yüklə
      const res = await get(`/api/merges/${mergeId}`);
      const data = res.data?.data || res.data;
      setMergeData(data);

      // 1. Qrupları yüklə və set et
      const groups = await fetchGroups();
      const normalizedGroups = normalizeOptions(groups, 'id');
      setGroupOptions(normalizedGroups);

      // 2. Əsas qrupu tap və set et
      const groupIds = (data.groups || []).map((g: any) => g.group_id);
      const mainGroupId = groupIds[0] || null;
      const otherGroupIds = groupIds.slice(1);

      if (mainGroupId) {
        setSelectedGroup(mainGroupId);

        // 3. Dərsləri yüklə və set et
        const lectures = await fetchLecturesByGroup(mainGroupId);
        const normalizedLectures = normalizeOptions(lectures, 'id');
        setLectureOptions(normalizedLectures);

        // 4. Dərsi tap (lecture_id ilə) və set et (value: option.id)
        const lectureObj = normalizedLectures.find((item: any) => String(item.lecture_id ?? item.id) === String(data.lecture_id));
        const lectureIdToSet = lectureObj ? lectureObj.id : null;

        if (lectureIdToSet) {
          setSelectedLecture(lectureIdToSet);

          // 5. Dərs tiplərini yüklə və set et
          const lessonTypes = await fetchLessonTypes(lectureIdToSet);
          const normalizedLessonTypes = normalizeOptions(lessonTypes, 'lesson_type_id');
          setLessonTypeOptions(normalizedLessonTypes);

          // 6. Dərs tipini tap və set et
          const lessonTypeObj = findById(normalizedLessonTypes, data.lesson_type_id);
          const lessonTypeIdToSet = lessonTypeObj ? lessonTypeObj.id : null;

          if (lessonTypeIdToSet) {
            setSelectedLessonType(lessonTypeIdToSet);

            // 7. Digər qrupları merge məlumatından doldur və seç
            const groupsFromMerge = Array.isArray(data.groups) ? data.groups : [];
            const otherGroupsFromMerge = groupsFromMerge.filter((g: any) => g.group_id !== mainGroupId);
            const normalizedOtherGroupsFromMerge = normalizeOptions(otherGroupsFromMerge, 'group_id');
            setOtherGroupOptions(normalizedOtherGroupsFromMerge);
            setSelectedOtherGroup(otherGroupIds);
          }
        }
      }
    } catch (error) {
      console.error('Fetch merge data error:', error);
      errorAlert('Xəta', 'Məlumatlar yüklənə bilmədi!');
    }
  };

  // Modal açıldıqda məlumatları yüklə
  useEffect(() => {
    if (isOpen) {
      // State-ləri sıfırla
      setSelectedGroup(null);
      setSelectedLecture(null);
      setSelectedLessonType(null);
      setSelectedOtherGroup([]);
      setLectureOptions([]);
      setLessonTypeOptions([]);
      setOtherGroupOptions([]);
      setIsManualChange(false);

      if (mergeId) {
        fetchMergeData();
      } else {
        fetchGroups().then(groups => setGroupOptions(groups));
      }
    }
  }, [isOpen, mergeId]);

  // Manual dəyişikliklər üçün useEffect-lər
  useEffect(() => {
    if (selectedGroup && isManualChange) {
      setSelectedLecture(null);
      setSelectedLessonType(null);
      setSelectedOtherGroup([]);
      setLectureOptions([]);
      setLessonTypeOptions([]);
      setOtherGroupOptions([]);
      fetchLecturesByGroup(selectedGroup).then(lectures => {
        const normalizedLectures = normalizeOptions(lectures, 'id');
        setLectureOptions(normalizedLectures);
      });
    }
  }, [selectedGroup, isManualChange]);

  useEffect(() => {
    if (selectedLecture && isManualChange) {
      setSelectedLessonType(null);
      setSelectedOtherGroup([]);
      setLessonTypeOptions([]);
      setOtherGroupOptions([]);
      fetchLessonTypes(selectedLecture).then(lessonTypes => {
        const normalizedLessonTypes = normalizeOptions(lessonTypes, 'lesson_type_id');
        setLessonTypeOptions(normalizedLessonTypes);
      });
    }
  }, [selectedLecture, isManualChange]);

  useEffect(() => {
    if (selectedLecture && selectedLessonType && isManualChange) {
      setSelectedOtherGroup([]);
      setOtherGroupOptions([]);
      fetchOtherGroups(selectedLecture, selectedLessonType).then(otherGroups => {
        const normalizedOtherGroups = normalizeOptions(otherGroups, 'group_id');
        setOtherGroupOptions(normalizedOtherGroups);
      });
    }
  }, [selectedLecture, selectedLessonType, isManualChange]);

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
      const group_ids = [selectedGroup, ...selectedOtherGroup];

      await put(`/api/merges/${mergeId}`, {
        lecture_id: selectedLecture,
        lesson_type_id: selectedLessonType,
        group_ids,
        semester_id: 20252,
      });

      successAlert('Uğurlu', 'Birləşmə uğurla yeniləndi!');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <span className="sr-only">Bağla</span>
          ×
        </button>
        <h2 className="text-lg font-semibold mb-6 text-slate-800">Birləşməni redaktə et</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Qrup seçin</label>
            <VirtualSelect
              name="group"
              value={selectedGroup}
              onChange={(val) => {
                setIsManualChange(true);
                setSelectedGroup(val);
              }}
              options={groupOptions}
              labelKey="name"
              placeholder="Qrup seçin"
              isLoading={loadingGroups}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Dərs seçin</label>
            <VirtualSelect
              name="lecture"
              value={selectedLecture}
              onChange={(val) => {
                setIsManualChange(true);
                setSelectedLecture(val);
              }}
              options={lectureOptions}
              labelKey="name"
              placeholder="Dərs seçin"
              isLoading={loadingLectures}
              required
              disabled={!selectedGroup}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Dərs tipi</label>
            <VirtualSelect
              name="lesson_type"
              value={selectedLessonType}
              onChange={(val) => {
                setIsManualChange(true);
                setSelectedLessonType(val);
              }}
              options={lessonTypeOptions}
              labelKey="lesson_type"
              placeholder="Dərs tipi seçin"
              isLoading={loadingLessonTypes}
              required
              disabled={!selectedLecture}
            />
          </div>
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
              excludeValues={[selectedGroup, ...selectedOtherGroup]}
              onOpen={() => {
                if (selectedLecture && selectedLessonType) {
                  fetchOtherGroups(selectedLecture, selectedLessonType).then((updatedGroups) => {
                    setOtherGroupOptions(updatedGroups);
                  });
                }
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg transition"
            disabled={
              submitting ||
              !selectedGroup ||
              !selectedLecture ||
              !selectedLessonType ||
              !selectedOtherGroup ||
              selectedOtherGroup.length === 0
            }
          >
            {submitting ? 'Yüklənir...' : 'Yenilə'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MergeEditModal;