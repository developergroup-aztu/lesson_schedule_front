import { useAuth } from '../../Context/AuthContext';
import { get, postFile } from '../../api/service';
import { useState, useEffect, useMemo } from 'react';
import VirtualSelect from '../../components/Select/ScheduleSelect';
import { useSweetAlert } from '../../hooks/useSweetAlert';
import Swal from 'sweetalert2';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import usePermissions from '../../hooks/usePermissions';

const formatSemesterName = (code: string): string => {
  if (!code || code.length < 5) return code;
  const year = code.slice(0, 4);
  const seasonCode = code.slice(4);

  let season = '';
  switch (seasonCode) {
    case '1':
      season = 'Yaz semestri';
      break;
    case '2':
      season = 'Payız semestri';
      break;
    case '5':
      season = 'Yay semestri';
      break;
    default:
      return code;
  }

  return `${year} ${season}`;
};

const Print = () => {
  const { user } = useAuth();
  const { successAlert, errorAlert, showConfirmAlert } = useSweetAlert();
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);
  const facultyId = user?.faculty_id;
  const isSuperAdmin = !!user?.roles?.includes('SuperAdmin') || !!user?.roles?.includes('admin');

  const [isLoading, setIsLoading] = useState(false);
  const [hasOpenedHours, setHasOpenedHours] = useState(false);
  const [hasOpenedFaculties, setHasOpenedFaculties] = useState(false);
  const [hasOpenedRooms, setHasOpenedRooms] = useState(false);
  const [hasOpenedTeachers, setHasOpenedTeachers] = useState(false);

  const [isLoadingHours, setIsLoadingHours] = useState(false);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const [groups, setGroups] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [selectedGroupHourIds, setSelectedGroupHourIds] = useState<number[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [selectedRoomHourIds, setSelectedRoomHourIds] = useState<number[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [selectedTeacherHourIds, setSelectedTeacherHourIds] = useState<number[]>([]);

  const [selectedGroupSemesterId, setSelectedGroupSemesterId] = useState<number | null>(null);
  const [selectedRoomSemesterId, setSelectedRoomSemesterId] = useState<number | null>(null);
  const [selectedTeacherSemesterId, setSelectedTeacherSemesterId] = useState<number | null>(null);

  const canViewRoomPrint = usePermissions('room_print');
  const canViewTeacherPrint = usePermissions('teacher_print');
  const canViewGroupPrint = usePermissions('group_print');
  const canViewFaculties = usePermissions('view_faculties');

  const [hasOpenedSemesters, setHasOpenedSemesters] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);

  const endpoint = useMemo(() => {
    if (isSuperAdmin) {
      const fid = selectedFaculty ?? facultyId;
      return fid ? `/api/groups?faculty_id=${fid}` : '';
    }
    if (user?.roles?.includes('FacultyAdmin')) {
      return `/api/groups?faculty_id=${facultyId}`;
    }
    return `/api/groups-all`;
  }, [isSuperAdmin, selectedFaculty, facultyId, user]);

  useEffect(() => {
    if (!endpoint) {
      setGroups([]);
      return;
    }
    get(endpoint).then((res) => {
      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const normalized = arr.map((g: any) => ({ id: g.id, name: g.name }));
      setGroups(normalized);
    });
  }, [endpoint]);

  useEffect(() => {
    if (hasOpenedHours) {
      setIsLoadingHours(true);
      get('/api/hours').then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setHours(data.map((h: any) => ({ id: h.id, name: h.time })));
      }).finally(() => {
        setIsLoadingHours(false);
      });
    }
  }, [hasOpenedHours]);

  useEffect(() => {
    if (isSuperAdmin && hasOpenedFaculties) {
      setIsLoadingFaculties(true);
      get('/api/faculties').then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setFaculties(data.map((f: any) => ({ id: f.id, name: f.name })));
      }).finally(() => {
        setIsLoadingFaculties(false);
      });
    }
  }, [isSuperAdmin, hasOpenedFaculties]);

  useEffect(() => {
    if (hasOpenedRooms) {
      setIsLoadingRooms(true);
      get('/api/rooms').then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const formattedRooms = data.map((r: any) => ({
          id: r.id,
          name: `${r.name} (Korpus: ${r.corp_id})`
        }));
        setRooms(formattedRooms);
      }).finally(() => {
        setIsLoadingRooms(false);
      });
    }
  }, [hasOpenedRooms]);

  useEffect(() => {
    if (hasOpenedTeachers) {
      setIsLoadingTeachers(true);
      get('/api/teachers').then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const formattedTeachers = data.map((t: any) => ({
          id: t.id,
          name: `${t.name} ${t.surname}`
        }));
        setTeachers(formattedTeachers);
      }).finally(() => {
        setIsLoadingTeachers(false);
      });
    }
  }, [hasOpenedTeachers]);

  useEffect(() => {
    if (hasOpenedSemesters) {
      setIsLoadingSemesters(true);
      get('/api/semesters')
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setSemesters(
            data.map((s: any) => ({
              id: s.id,
              name: formatSemesterName(s.year),
            })),
          );
        })
        .finally(() => {
          setIsLoadingSemesters(false);
        });
    }
  }, [hasOpenedSemesters]);

  // ...existing code...
  const handleDownload = async () => {
    if (selectedGroupIds.length === 0 || selectedGroupHourIds.length === 0) {
      errorAlert('Xəta', 'Zəhmət olmasa qrup və saatları seçin.');
      return;
    }
    setIsLoading(true);
    showConfirmAlert('Yüklənir...', 'PDF faylı hazırlanır. Zəhmət olmasa gözləyin.');
    try {
      const fid = isSuperAdmin ? (selectedFaculty ?? facultyId) : facultyId;
      const url = `/api/schedule/faculty/${fid}/print2`;
      const payload: any = {
        group_ids: selectedGroupIds,
        hour_ids: selectedGroupHourIds,
      };

      if (selectedGroupSemesterId) {
        payload.semester_id = selectedGroupSemesterId;
      }
      const res = await postFile(url, payload);
      Swal.close();
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank'); // Yeni tab-da açır
      successAlert('Uğurlu', 'PDF faylı yeni tab-da açıldı!');
    } catch (error) {
      Swal.close();
      errorAlert('Xəta', 'Fayl yüklənərkən bir problem yarandı. Zəhmət olmasa yenidən cəhd edin.');
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // ...existing code...

  // ...existing code...
  const handleRoomDownload = async () => {
    if (selectedRoomIds.length === 0) {
      errorAlert('Xəta', 'Zəhmət olmasa otaqları seçin.');
      return;
    }
    setIsLoading(true);
    showConfirmAlert('Yüklənir...', 'PDF faylı hazırlanır. Zəhmət olmasa gözləyin.');
    try {
      const url = `/api/schedule/room/print`;
      const payload: any = {
        room_ids: selectedRoomIds,
        hour_ids: selectedRoomHourIds,
      };

      if (selectedRoomSemesterId) {
        payload.semester_id = selectedRoomSemesterId;
      }
      const res = await postFile(url, payload);
      Swal.close();
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank'); // Yeni tab-da açır
      successAlert('Uğurlu', 'PDF faylı yeni tab-da açıldı!');
    } catch (error) {
      Swal.close();
      errorAlert('Xəta', 'Fayl yüklənərkən bir problem yarandı. Zəhmət olmasa yenidən cəhd edin.');
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherDownload = async () => {
    if (selectedTeacherIds.length === 0) {
      errorAlert('Xəta', 'Zəhmət olmasa müəllimi(ləri) seçin.');
      return;
    }
    setIsLoading(true);
    showConfirmAlert('Yüklənir...', 'PDF faylı hazırlanır. Zəhmət olmasa gözləyin.');
    try {
      const url = `/api/schedule/teacher/print`;
      const payload: any = {
        teacher_ids: selectedTeacherIds,
        hour_ids: selectedTeacherHourIds,
      };

      if (selectedTeacherSemesterId) {
        payload.semester_id = selectedTeacherSemesterId;
      }
      const res = await postFile(url, payload);
      Swal.close();
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank'); // Yeni tab-da açır
      successAlert('Uğurlu', 'PDF faylı yeni tab-da açıldı!');
    } catch (error) {
      Swal.close();
      errorAlert('Xəta', 'Fayl yüklənərkən bir problem yarandı. Zəhmət olmasa yenidən cəhd edin.');
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // ...existing

  return (
    <>
      <Breadcrumb pageName="Çap (PDF)" />

      <div className="flex flex-col gap-6">
        {/* Qrup Cədvəli üçün ayrı kart */}

        {
          canViewGroupPrint && (
            <div className="p-6 bg-white rounded-xl shadow">
              <h2 className="text-l font-bold text-gray-800 mb-4">Qrup Cədvəli (PDF)</h2>
              {canViewFaculties && (
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium text-slate-700">Fakültə</label>
                  <VirtualSelect
                    name="faculty"
                    value={selectedFaculty}
                    onChange={(val) => setSelectedFaculty(val as number)}
                    options={faculties}
                    placeholder="Fakültə seçin"
                    onOpen={() => setHasOpenedFaculties(true)}
                    isLoading={isLoadingFaculties}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-slate-700">Semestr (istəyə bağlı)</label>
                <VirtualSelect
                  name="group_semester"
                  value={selectedGroupSemesterId}
                  onChange={(val) => setSelectedGroupSemesterId(val as number)}
                  options={semesters}
                  placeholder="Semestr seçin (boş buraxıla bilər)"
                  onOpen={() => setHasOpenedSemesters(true)}
                  isLoading={isLoadingSemesters}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-slate-700">Saatlar</label>
                <VirtualSelect
                  name="group_hours"
                  value={selectedGroupHourIds}
                  onChange={(val) => setSelectedGroupHourIds(val as number[])}
                  options={hours}
                  multiple
                  placeholder="Saatları seçin"
                  onOpen={() => setHasOpenedHours(true)}
                  isLoading={isLoadingHours}
                />
              </div>
              <div className="mb-6">
                <label className="block mb-1 text-sm font-medium text-slate-700">Qruplar</label>
                <VirtualSelect
                  name="groups"
                  value={selectedGroupIds}
                  onChange={(val) => setSelectedGroupIds(val as number[])}
                  options={groups}
                  multiple
                  placeholder="Qrupları seçin"
                />
              </div>
              <button
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                onClick={handleDownload}
                disabled={
                  isLoading || selectedGroupIds.length === 0 || selectedGroupHourIds.length === 0 || (isSuperAdmin && !selectedFaculty && !facultyId)
                }
              >
                {isLoading ? 'Yüklənir...' : 'Qrup PDF Yüklə'}
              </button>
            </div>
          )
        }


        <div className="flex flex-col gap-6">

          {/* SuperAdmin üçün otaq və müəllim cədvəli */}
          {canViewRoomPrint && (
            <div className="p-6 bg-white rounded-xl shadow">
              <h2 className="text-l font-bold text-gray-800 mb-4">Otaq Cədvəli (PDF)</h2>
              {/* ...Otaq Cədvəli formu... */}
              <div className="mb-6">
                <label className="block mb-1 text-sm font-medium text-slate-700">Otaqlar</label>
                <VirtualSelect
                  name="rooms"
                  value={selectedRoomIds}
                  onChange={(val) => setSelectedRoomIds(val as number[])}
                  options={rooms}
                  multiple
                  placeholder="Otaqları seçin"
                  onOpen={() => setHasOpenedRooms(true)}
                  isLoading={isLoadingRooms}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-slate-700">Semestr (istəyə bağlı)</label>
                <VirtualSelect
                  name="room_semester"
                  value={selectedRoomSemesterId}
                  onChange={(val) => setSelectedRoomSemesterId(val as number)}
                  options={semesters}
                  placeholder="Semestr seçin (boş buraxıla bilər)"
                  onOpen={() => setHasOpenedSemesters(true)}
                  isLoading={isLoadingSemesters}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-slate-700">Saatlar</label>
                <VirtualSelect
                  name="room_hours"
                  value={selectedRoomHourIds}
                  onChange={(val) => setSelectedRoomHourIds(val as number[])}
                  options={hours}
                  multiple
                  placeholder="Saatları seçin (İstəyə bağlıdır)"
                  onOpen={() => setHasOpenedHours(true)}
                  isLoading={isLoadingHours}
                />
              </div>
              <button
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                onClick={handleRoomDownload}
                disabled={isLoading || selectedRoomIds.length === 0}
              >
                {isLoading ? 'Yüklənir...' : 'Otaq PDF Yüklə'}
              </button>
            </div>)}

          {canViewTeacherPrint && (
            <div className="p-6 bg-white rounded-xl shadow">
              <h2 className="text-l font-bold text-gray-800 mb-4">Müəllim Cədvəli (PDF)</h2>
              {/* ...Müəllim Cədvəli formu... */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-slate-700">Müəllimlər</label>
                <VirtualSelect
                  name="teachers"
                  value={selectedTeacherIds}
                  onChange={(val) => setSelectedTeacherIds(val as number[])}
                  options={teachers}
                  multiple
                  placeholder="Müəllimləri seçin"
                  onOpen={() => setHasOpenedTeachers(true)}
                  isLoading={isLoadingTeachers}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-slate-700">Semestr (istəyə bağlı)</label>
                <VirtualSelect
                  name="teacher_semester"
                  value={selectedTeacherSemesterId}
                  onChange={(val) => setSelectedTeacherSemesterId(val as number)}
                  options={semesters}
                  placeholder="Semestr seçin (boş buraxıla bilər)"
                  onOpen={() => setHasOpenedSemesters(true)}
                  isLoading={isLoadingSemesters}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-slate-700">Saatlar</label>
                <VirtualSelect
                  name="teacher_hours"
                  value={selectedTeacherHourIds}
                  onChange={(val) => setSelectedTeacherHourIds(val as number[])}
                  options={hours}
                  multiple
                  placeholder="Saatları seçin (İstəyə bağlıdır)"
                  onOpen={() => setHasOpenedHours(true)}
                  isLoading={isLoadingHours}
                />
              </div>
              <button
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                onClick={handleTeacherDownload}
                disabled={isLoading || selectedTeacherIds.length === 0}
              >
                {isLoading ? 'Yüklənir...' : 'Müəllim PDF Yüklə'}
              </button>
            </div>)}

        </div>


      </div>
    </>
  );
};

export default Print;