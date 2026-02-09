export interface Hour {
  id: number;
  name: string;
  time: string;
  status: number;
}

export interface Day {
  id: number;
  name: string;
  status: number;
}

export interface Room {
  room_id: number;
  room_name: string;
  corp_name: string;
}

export interface Teacher {
  code: string;
  name: string;
  surname: string;
}

export interface Subject {
  subject_id: number;
  subject_name: string;
}

export interface Lesson {
  schedule_id: number;
  subject_id: number;
  subject_name: string;
  lesson_type_id: number;
  lesson_type_name: string;
  teacher: Teacher;
  room: Room;
  week_type_id: number;
  week_type_name: string;
  confirm_status: number;
  blocked: boolean;
}

export interface HourWithLessons {
  hour_id: number;
  lessons: Lesson[];
}

export interface Day {
  day_id: number;
  hours: HourWithLessons[];
}

export interface Group {
  group_id: number;
  group_name: string;
  days: Day[];
}

export interface Faculty {
  faculty_id: number;
  faculty_name: string;
  groups: Group[];
}

export interface ScheduleData {
  faculty: Faculty;
  hours: Hour[];
  lesson_types: {
    id: number;
    name: string;
  }[];
  week_types: {
    id: number;
    name: string;
  }[];
  subjects: Subject[];
  rooms: Room[];
}

export interface ScheduleContextType {
  scheduleData: ScheduleData;
  setScheduleData: React.Dispatch<React.SetStateAction<ScheduleData>>;
  addLesson: (groupId: number, dayId: number, hourId: number, lesson: Lesson) => void;
  editLesson: (groupId: number, dayId: number, hourId: number, lessonIndex: number, updatedLesson: Lesson) => void;
  deleteLesson: (groupId: number, dayId: number, hourId: number, lessonIndex: number) => void;
  toggleBlockStatus: (groupId: number, dayId: number, hourId: number, lessonIndex: number) => void;
}