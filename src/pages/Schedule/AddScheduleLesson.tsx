import React, { useEffect, useState } from 'react';
import { get, post, put } from '../../api/service';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import Swal from 'sweetalert2';

const AddScheduleLesson = () => {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [corps, setCorps] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [lessonTypes, setLessonTypes] = useState([]);
  const [lessonHours, setLessonHours] = useState([]);
  const [hours, setHours] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [weekTypes, setWeekTypes] = useState([]);
  const [days, setDays] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    faculty_id: '',
    department_id: '',
    group_id: [],
    corp_id: '',
    room_id: '',
    lesson_type_id: '',
    lesson_type_hour_id: '',
    hour_id: '',
    semester_id: '',
    week_type_id: '',
    day_id: '',
    user_id: '',
    discipline_id: '',
  });

  const fetchData = async (endpoint, setState) => {
    try {
      const response = await get(endpoint);
      setState(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  useEffect(() => {
    fetchData('/api/groups', setGroups);
    fetchData('/api/corps', setCorps);
    fetchData('/api/rooms', setRooms);
    fetchData('/api/lesson_types', setLessonTypes);
    fetchData('/api/lesson-hours', setLessonHours);
    fetchData('/api/hours', setHours);
    fetchData('/api/semesters', setSemesters);
    fetchData('/api/week_types', setWeekTypes);
    fetchData('/api/days', setDays);
    fetchData('/api/users', setUsers);
    fetchData('/api/faculties', setFaculties);
    fetchData('/api/departments', setDepartments);
    fetchData('/api/disciplines', setDisciplines);
  }, []);

  useEffect(() => {
    if (id) {
      fetchData(`/api/schedules/${id}`, setFormData);
    }
  }, [id]);

  useEffect(() => {
    if (formData.faculty_id) {
      const filtered = departments.filter(
        (department) => department.faculty_id === parseInt(formData.faculty_id),
      );
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments([]);
    }
  }, [formData.faculty_id, departments]);

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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGroupChange = (selectedOptions) => {
    const groupIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData({
      ...formData,
      group_id: groupIds,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await put(`/api/schedules/${id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Yeniləndi',
          text: 'Dərs uğurla yeniləndi',
        });
      } else {
        await post('/api/schedules', formData);
        Swal.fire({
          icon: 'success',
          title: 'Əlavə edildi',
          text: 'Dərs uğurla əlavə edildi',
        });
      }
      navigate('/schedule');
    } catch (error) {
      console.error('Error adding/updating schedule lesson:', error);
      if (error.response && error.response.data && error.response.data.message) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.response.data.message,
        });
      } else if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        Swal.fire({
          icon: 'error',
          title: 'Xəta',
          text: errorMessages,
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

  const groupOptions = groups.map(group => ({
    value: group.id,
    label: group.name,
  }));

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
        {id ? 'Dərsi Redaktə Et' : 'Dərs Cədvəlinə Dərs Əlavə Et'}
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
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
          <Select
            isMulti
            name="group_id"
            value={groupOptions.filter(option => formData.group_id.includes(option.value))}
            onChange={handleGroupChange}
            options={groupOptions}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div>
          <label className="block font-medium">Korpus:</label>
          <select
            name="corp_id"
            value={formData.corp_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
          >
            <option value="">Seçin</option>
            {filteredRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} - {room.room_type.name}
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
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
          <label className="block font-medium">Dərs Saatları:</label>
          <select
            name="lesson_type_hour_id"
            value={formData.lesson_type_hour_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
          >
            <option value="">Seçin</option>
            {lessonHours.map((lessonHour) => (
              <option key={lessonHour.id} value={lessonHour.id}>
                {lessonHour.hour}
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
          >
            <option value="">Seçin</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
              {semester.year}  - {semester.semester_num} 
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
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
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-400"
          >
            <option value="">Seçin</option>
            {filteredDisciplines.map((discipline) => (
              <option key={discipline.id} value={discipline.id}>
                {discipline.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 text-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
          >
            {id ? 'Yenilə' : 'Əlavə et'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddScheduleLesson;