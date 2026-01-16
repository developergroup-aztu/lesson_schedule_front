import React, { useState, useEffect } from 'react';
import VirtualSelect from '../../Select/ScheduleSelect';
import { get, put } from '../../../api/service';
import { useAuth } from '../../../Context/AuthContext';
import useSweetAlert from '../../../hooks/useSweetAlert';

interface EditMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mergeId: string | number;
}

const EditMergeModal: React.FC<EditMergeModalProps> = ({ isOpen, onClose, onSuccess, mergeId }) => {
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
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [initialData, setInitialData] = useState<any>(null);

  const { user } = useAuth();

  // Qrupları yüklə (yalnız kliklənəndə)
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
        return { ...group, id: group.id, name: nameWithFaculty };
      });

      setGroupOptions(formattedGroups);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Qrupa görə dərsləri yüklə (yalnız kliklənəndə)
  const fetchLecturesByGroup = async (groupId: any) => {
    setLoadingLectures(true);
    try {
      const res = await get(`/api/groups/${groupId}/lectures`);
      const lectures = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setLectureOptions(lectures);
      return lectures;
    } finally {
      setLoadingLectures(false);
    }
  };
  

  // Dərsə görə dərs tiplərini yüklə (yalnız kliklənəndə)
  const fetchLessonTypes = async (lectureId: any) => {
    setLoadingLessonTypes(true);
    try {
      const res = await get(`/api/lessons/${lectureId}/lesson-types`);
      const types = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setLessonTypeOptions(types);
      return types;
    } finally {
      setLoadingLessonTypes(false);
    }
  };

  // Digər qrupları yüklə (yalnız kliklənəndə)
const fetchOtherGroups = async (lessonId: any, lessonTypeId: any) => {
    setLoadingOtherGroups(true);
    try {
      const res = await get(`/api/lessons/${lessonId}/groups?lesson_type_id=${lessonTypeId}`);
      const groups = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // append faculty_name to group_name for display
      const mapped = groups.map((g: any) => ({
        ...g,
        id: g.group_id ?? g.id,
        group_id: g.group_id ?? g.id,
        group_name: g.group_name + (g.faculty_name ? ` (${g.faculty_name})` : '')
      }));

      setOtherGroupOptions(mapped);
      return mapped;
    } finally {
      setLoadingOtherGroups(false);
    }
  };

  

  
  // Modal açılanda yalnız merge datasını yüklə və selectləri doldur
  useEffect(() => {
    if (isOpen && mergeId) {
      const loadInitialData = async () => {
        setLoadingInitial(true);
        try {
          const res = await get(`/api/merges/${mergeId}`);
          const payload = res.data;
          setInitialData(payload);

          // Support both old "groups" array and new flat structure with group_id + other_groups
          // Main group
          if (payload.groups && Array.isArray(payload.groups) && payload.groups.length > 0) {
            const firstGroup = payload.groups[0];
            setSelectedGroup(firstGroup.group_id);
            setGroupOptions(payload.groups.map((g: any) => ({
              id: g.group_id,
              name: g.group_name + (g.faculty_name ? ` (${g.faculty_name})` : ''),
              group_id: g.group_id
            })));
          } else if (payload.group_id) {
            setSelectedGroup(payload.group_id);
            setGroupOptions([{
              id: payload.group_id,
              name: payload.group_name + (payload.faculty_name ? ` (${payload.faculty_name})` : ''),
              group_id: payload.group_id
            }]);
          }

          // Lecture
          if (payload.lecture_id) {
            // Keep lecture id as string/number consistent with select value usage
            setSelectedLecture(String(payload.lecture_id));
            setLectureOptions([{
              id: payload.lecture_id, // Use lecture_id as id for display
              name: payload.lecture_name,
              lecture_id: payload.lecture_id,
              lesson_id: payload.lesson_id // Add lesson_id for lesson type selection
            }]);
          } else if (payload.lectureOptions) {
            setLectureOptions(Array.isArray(payload.lectureOptions) ? payload.lectureOptions : []);
          }

          // Lesson type
          if (payload.lesson_type_id) {
            setSelectedLessonType(payload.lesson_type_id);
            setLessonTypeOptions([{
              id: payload.lesson_type_id,
              lesson_type: payload.lesson_type_name
            }]);
          }

          // Other groups (may be "other_groups" or groups.slice(1) in old payload)
          const otherGroupsArr = payload.other_groups && Array.isArray(payload.other_groups)
            ? payload.other_groups
            : (payload.groups && payload.groups.length > 1 ? payload.groups.slice(1) : []);
          if (otherGroupsArr && otherGroupsArr.length > 0) {
            setSelectedOtherGroup(otherGroupsArr.map((g: any) => g.group_id));
            setOtherGroupOptions(otherGroupsArr.map((g: any) => ({
              id: g.group_id,
              group_id: g.group_id,
              group_name: g.group_name
            })));
          }
        } catch (error) {
          errorAlert('Xəta', 'Məlumatları yükləmək mümkün olmadı.');
        } finally {
          setLoadingInitial(false);
        }
      };

      // Hər şeyi sıfırla əvvəl
      setSelectedGroup(null);
      setSelectedLecture(null);
      setSelectedLessonType(null);
      setSelectedOtherGroup([]);
      setGroupOptions([]);
      setLectureOptions([]);
      setLessonTypeOptions([]);
      setOtherGroupOptions([]);
      setInitialData(null);

      loadInitialData();
    }
  }, [isOpen, mergeId]);

  // Qrup dəyişəndə
  const handleGroupChange = async (val: any) => {
    setSelectedGroup(val);
    setSelectedLecture(null);
    setSelectedLessonType(null);
    setSelectedOtherGroup([]);
    setLectureOptions([]);
    setLessonTypeOptions([]);
    setOtherGroupOptions([]);
    
    if (val) {
      await fetchLecturesByGroup(val);
    }
  };

  // Dərs dəyişəndə
const handleLectureChange = async (val: any) => {
    setSelectedLecture(val);
    setSelectedLessonType(null);
    setSelectedOtherGroup([]);
    setLessonTypeOptions([]);
    setOtherGroupOptions([]);
    
    if (val) {
      const selectedLectureObj = lectureOptions.find(
        (item) =>
          String(item.lecture_id) === String(val) ||
          String(item.id) === String(val) ||
          String(item.lesson_id) === String(val)
      );
      // Use the lesson_id from the selected lecture (preferred) for lesson types
      const lessonIdToUse = selectedLectureObj?.lesson_id || selectedLectureObj?.id || val;
      await fetchLessonTypes(lessonIdToUse);
    }
  };

  // Dərs tipi dəyişəndə
 const handleLessonTypeChange = async (val: any) => {
    setSelectedLessonType(val);
    setSelectedOtherGroup([]);
    setOtherGroupOptions([]);
    
    if (!val) return;

    // Try to find selected lecture object from lectures list
    const selectedLectureObj = lectureOptions.find(
      (item: any) =>
        String(item.lecture_id) === String(selectedLecture) ||
        String(item.id) === String(selectedLecture) ||
        String(item.lesson_id) === String(selectedLecture)
    );

    // If user changed lecture (selectedLecture differs from initial merge lecture_id),
    // prefer the lectures array "id" (row id) for other-groups endpoint.
    // Otherwise use initialData.lesson_id as before.
    const lessonIdForGroups = (initialData && String(selectedLecture) !== String(initialData.lecture_id))
      ? (selectedLectureObj?.id || selectedLectureObj?.lesson_id || selectedLecture)
      : (initialData?.lesson_id || selectedLectureObj?.id || selectedLecture);

    if (lessonIdForGroups) {
      await fetchOtherGroups(lessonIdForGroups, val);
    }
  };
  // PUT
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
        (item) => item.lecture_id === selectedLecture || item.id === selectedLecture
      );
      const lecture_id = selectedLectureObj?.lecture_id || selectedLecture;

      const otherGroupIds = selectedOtherGroup
        .map((selectedId: any) => {
          const obj = otherGroupOptions.find((item) => item.id === selectedId || item.group_id === selectedId);
          return obj?.group_id || selectedId;
        })
        .filter(Boolean);

      const group_ids = [selectedGroup, ...otherGroupIds];

      await put(`/api/merges/${mergeId}`, {
        lecture_id,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-9999">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <span className="sr-only">Bağla</span>×
        </button>

        <h2 className="text-lg font-semibold mb-6 text-slate-800 m-0">Birləşməni redaktə et</h2>

        {loadingInitial ? (
          <div className="flex justify-center py-8">
            <span className="text-slate-600">Yüklənir...</span>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Qrup seçimi */}
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Qrup seçin</label>
              <VirtualSelect
                name="group"
                value={selectedGroup}
                onChange={handleGroupChange}
                options={groupOptions}
                labelKey="name"
                placeholder="Qrup seçin"
                isLoading={loadingGroups}
                required
                onOpen={() => {
                  if (groupOptions.length === 1 && !loadingGroups) fetchGroups();
                }}
              />
            </div>

            {/* Dərs seçimi */}
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Dərs seçin</label>
              <VirtualSelect
                name="lecture"
                value={selectedLecture}
                onChange={handleLectureChange}
                options={lectureOptions}
                labelKey="name"
                placeholder="Dərs seçin"
                isLoading={loadingLectures}
                required
                disabled={!selectedGroup}
                onOpen={() => {
                  if (selectedGroup && lectureOptions.length === 1 && !loadingLectures) {
                    fetchLecturesByGroup(selectedGroup);
                  }
                }}
              />
            </div>

            {/* Dərs tipi seçimi */}
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Dərs tipi</label>
              <VirtualSelect
                name="lesson_type"
                value={selectedLessonType}
                onChange={handleLessonTypeChange}
                options={lessonTypeOptions}
                labelKey="lesson_type"
                placeholder="Dərs tipi seçin"
                isLoading={loadingLessonTypes}
                required
                disabled={!selectedLecture}
                onOpen={() => {
                  if (lessonTypeOptions.length === 1 && !loadingLessonTypes) {
                    let lessonIdToUse;
                    
                    // If lecture was changed, use the lesson_id from the selected lecture
                    if (selectedLecture) {
                      const selectedLectureObj = lectureOptions.find(
                        (item) =>
                          String(item.lecture_id) === String(selectedLecture) ||
                          String(item.id) === String(selectedLecture) ||
                          String(item.lesson_id) === String(selectedLecture)
                      );
                      lessonIdToUse = selectedLectureObj?.lesson_id || selectedLectureObj?.id;
                    }
                    
                    // If no lecture was selected or found, use the initial lesson_id from merge data
                    if (!lessonIdToUse) {
                      lessonIdToUse = initialData?.lesson_id;
                    }
                    
                    if (lessonIdToUse) {
                      fetchLessonTypes(lessonIdToUse);
                    }
                  }
                }}
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
                onOpen={() => {
                  if (selectedLessonType && otherGroupOptions.length <= 1 && !loadingOtherGroups) {
                    const selectedLectureObj = lectureOptions.find(
                      (item) =>
                        String(item.lecture_id) === String(selectedLecture) ||
                        String(item.id) === String(selectedLecture) ||
                        String(item.lesson_id) === String(selectedLecture)
                    );

                    const lessonIdForGroups = (initialData && String(selectedLecture) !== String(initialData.lecture_id))
                      ? (selectedLectureObj?.id || selectedLectureObj?.lesson_id || selectedLecture)
                      : (initialData?.lesson_id || selectedLectureObj?.id || selectedLecture);

                    if (lessonIdForGroups) {
                      fetchOtherGroups(lessonIdForGroups, selectedLessonType);
                    }
                  }
                }}
              />
            </div>

            {/* Submit düyməsi */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                submitting ||
                !selectedGroup ||
                !selectedLecture ||
                !selectedLessonType ||
                !selectedOtherGroup ||
                selectedOtherGroup.length === 0
              }
            >
              {submitting ? 'Yüklənir...' : 'Yadda saxla'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditMergeModal;