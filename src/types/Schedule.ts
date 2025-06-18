export  interface Group {
  id: number;
  name: string;
}


export interface RoomType {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  name: string;
  corp_id: number;
  room_type: RoomType;
}

export interface LessonType {
  id: number;
  name: string;
}



export interface Hour {
  id: number;
  name: string;
}



export interface WeekType {
  id: number;
  name: string;
}

export interface Day {
  id: number;
  name: string;
}

export interface User {
  user_id: string
  name: string;
  department_names: Record<string, number>;
  surname: string
}

export interface Discipline {
  id: number;
  name: string;
  department_id: number;
}

export interface FormData {
  group_id: number[];
  day_id: number;
  hour_id: string;
  discipline_id: string;
  lesson_type_id: string;
  week_type_id: string;
  user_id: string;
  room_id: string;
}

export interface SelectOption {
  value: number;
  label: string;
}


export interface Department {
  faculty_code: string;
  name: string;
}

export interface Faculty {
  id: string;
  name: string;
  faculty_code: string;
  departments: Department[];
}