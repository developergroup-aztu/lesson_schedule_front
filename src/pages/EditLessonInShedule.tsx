import React, { useEffect, useState } from 'react';
import { get, put, del } from '../api/service';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import DeleteConfirmModal from '../components/Modals/Schedule/DeleteSchedule';

const EditLessonInShedule = () => {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [corps, setCorps] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [lessonTypes, setLessonTypes] = useState([]);
  const [hours, setHours] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [weekTypes, setWeekTypes] = useState([]);
  const [days, setDays] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);
  const [lessonHours, setLessonHours] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    faculty_id: '',
    department_id: '',
    group_id: '',
    corp_id: '',
    room_id: '',
    lesson_type_id: '',
    hour_id: '',
    semester_id: '',
    week_type_id: '',
    day_id: '',
    user_id: '',
    discipline_id: '',
    lesson_type_hour_id: '',
  });

  const fetchData = async () => {
    try {
      const [
        groupsResponse,
        corpsResponse,
        roomsResponse,
        lessonTypesResponse,
        hoursResponse,
        semestersResponse,
        weekTypesResponse,
        daysResponse,
        usersResponse,
        facultiesResponse,
        departmentsResponse,
        disciplinesResponse,
        lessonHoursResponse,
        scheduleResponse,
      ] = await Promise.all([
        get('/api/groups'),
        get('/api/corps'),
        get('/api/rooms'),
        get('/api/lesson_types'),
        get('/api/hours'),
        get('/api/semesters'),
        get('/api/week_types'),
        get('/api/days'),
        get('/api/users'),
        get('/api/faculties'),
        get('/api/departments'),
        get('/api/disciplines'),
        get('/api/lesson-hours'),
        get(`/api/schedules/${id}`),
      ]);

      setGroups(groupsResponse.data);
      setCorps(corpsResponse.data);
      setRooms(roomsResponse.data);
      setLessonTypes(lessonTypesResponse.data);
      setHours(hoursResponse.data);
      setSemesters(semestersResponse.data);
      setWeekTypes(weekTypesResponse.data);
      setDays(daysResponse.data);
      setUsers(usersResponse.data);
      setFaculties(facultiesResponse.data);
      setDepartments(departmentsResponse.data);
      setDisciplines(disciplinesResponse.data);
      setLessonHours(lessonHoursResponse.data);

      const schedule = scheduleResponse.data.schedule;
      setFormData({
        faculty_id:
          facultiesResponse.data.find(
            (faculty) => faculty.name === schedule.faculty_name,
          )?.id || '',
        department_id:
          departmentsResponse.data.find(
            (department) => department.name === schedule.department_name,
          )?.id || '',
        group_id:
          groupsResponse.data.find(
            (group) => group.name === schedule.group_name,
          )?.id || '',
        corp_id:
          corpsResponse.data.find((corp) => corp.name === schedule.corp_name)
            ?.id || '',
        room_id:
          roomsResponse.data.find((room) => room.name === schedule.room_name)
            ?.id || '',
        lesson_type_id:
          lessonTypesResponse.data.find(
            (lessonType) => lessonType.name === schedule.lesson_type_name,
          )?.id || '',
        hour_id:
          hoursResponse.data.find((hour) => hour.name === schedule.hour_name)
            ?.id || '',
        semester_id:
          semestersResponse.data.find(
            (semester) => semester.semester_num === schedule.semester_num,
          )?.id || '',
        week_type_id:
          weekTypesResponse.data.find(
            (weekType) => weekType.name === schedule.week_type_name,
          )?.id || '',
        day_id:
          daysResponse.data.find((day) => day.name === schedule.day_name)?.id ||
          '',
        user_id:
          usersResponse.data.find((user) => user.name === schedule.user_name)
            ?.id || '',
        discipline_id:
          disciplinesResponse.data.find(
            (discipline) => discipline.name === schedule.discipline_name,
          )?.id || '',
        lesson_type_hour_id:
          lessonHoursResponse.data.find(
            (lessonHour) => lessonHour.hour === schedule.lesson_type_hour,
          )?.id || '',
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (formData.faculty_id) {
      const filtered = departments.filter(
        (department) => department.faculty_id === parseInt(formData.faculty_id),
      );
      setFilteredDepartments(filtered);

      const filteredGroups = groups.filter(
        (group) => group.faculty_id === parseInt(formData.faculty_id),
      );
      setFilteredGroups(filteredGroups);
    } else {
      setFilteredDepartments([]);
      setFilteredGroups([]);
    }
  }, [formData.faculty_id, departments, groups]);

  useEffect(() => {
    if (formData.department_id) {
      const filteredDisciplines = disciplines.filter(
        (discipline) =>
          discipline.department_id === parseInt(formData.department_id),
      );
      setFilteredDisciplines(filteredDisciplines);

      const filteredUsers = users.filter((user) =>
        user.department_names && Object.values(user.department_names).includes(parseInt(formData.department_id)),
      );
      setFilteredUsers(filteredUsers);
    } else {
      setFilteredDisciplines([]);
      setFilteredUsers([]);
    }
  }, [formData.department_id, disciplines, users]);

  useEffect(() => {
    if (formData.corp_id) {
      const filteredRooms = rooms.filter(
        (room) => room.corp_id === parseInt(formData.corp_id),
      );
      setFilteredRooms(filteredRooms);
    } else {
      setFilteredRooms([]);
    }
  }, [formData.corp_id, rooms]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await put(`/api/schedules/${id}`, formData);
      navigate('/schedule');
    } catch (error) {
      console.error('Error adding/updating schedule lesson:', error);
      if (error.response && error.response.data && error.response.data.message) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.response.data.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Xəta',
          text: 'Dərs cədvələ əlavə olunarkən xəta baş verdi',
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      await del(`/api/schedules/${id}`);
      navigate('/schedule');
      Swal.fire({
        title: 'Silindi!',
        text: 'Dərs uğurla silindi.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      Swal.fire({
        title: 'Xəta!',
        text: error.response?.data?.message || 'Dərsi silərkən xəta baş verdi.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const getDayName = (dayNumber) => {
    const dayNames = {
      '1': 'Bazar ertəsi',
      '2': 'Çərşənbə axşamı',
      '3': 'Çərşənbə',
      '4': 'Cümə axşamı',
      '5': 'Cümə',
    };
    return dayNames[dayNumber] || dayNumber;
  };

  return (
    <div className="grid md:grid-cols-2 m-5 md:m-10 gap-4">
      <h2 className="col-span-2 text-center text-2xl font-bold">
        Dərsi Redaktə Et
      </h2>
      <form
        onSubmit={handleSubmit}
        className="col-span-2 grid grid-cols-2 gap-4"
      >
        <div>
          <label className="block font-medium">Fakültə:</label>
          <select
            name="faculty_id"
            value={formData.faculty_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg  dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Kafedra:</label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {filteredDepartments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Qrup:</label>
          <select
            name="group_id"
            value={formData.group_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {filteredGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Korpus:</label>
          <select
            name="corp_id"
            value={formData.corp_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {corps.map((corp) => (
              <option key={corp.id} value={corp.id}>
                {corp.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Otaq:</label>
          <select
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {filteredRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Dərs Tipi:</label>
          <select
            name="lesson_type_id"
            value={formData.lesson_type_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {lessonTypes.map((lessonType) => (
              <option key={lessonType.id} value={lessonType.id}>
                {lessonType.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Saat:</label>
          <select
            name="hour_id"
            value={formData.hour_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {hours.map((hour) => (
              <option key={hour.id} value={hour.id}>
                {hour.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Semestr:</label>
          <select
            name="semester_id"
            value={formData.semester_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.semester_num}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Həftə Tipi:</label>
          <select
            name="week_type_id"
            value={formData.week_type_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {weekTypes.map((weekType) => (
              <option key={weekType.id} value={weekType.id}>
                {weekType.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Gün:</label>
          <select
            name="day_id"
            value={formData.day_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                {getDayName(day.name)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Müəllim:</label>
          <select
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {filteredUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Fənn:</label>
          <select
            name="discipline_id"
            value={formData.discipline_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {filteredDisciplines.map((discipline) => (
              <option key={discipline.id} value={discipline.id}>
                {discipline.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Dərs Saatı:</label>
          <select
            name="lesson_type_hour_id"
            value={formData.lesson_type_hour_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Seçin</option>
            {lessonHours.map((lessonHour) => (
              <option key={lessonHour.id} value={lessonHour.id}>
                {lessonHour.hour}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 text-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
          >
            Yenilə
          </button>
        </div>
        <div className="col-span-2 text-center mt-4">
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Sil
          </button>
        </div>
      </form>
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EditLessonInShedule;