import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ScheduleData, ScheduleContextType, Lesson } from '../types';
import { mockScheduleData } from '../data/mockData';
import { useAuth } from './AuthContext';

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const [scheduleData, setScheduleData] = useState<ScheduleData>(mockScheduleData);

  const addLesson = (groupId: number, dayId: number, hourId: number, lesson: Lesson) => {
    setScheduleData(prevData => {
      const newData = { ...prevData };
      const groupIndex = newData.faculty.groups.findIndex(g => g.group_id === groupId);
      if (groupIndex === -1) return prevData;
      const group = newData.faculty.groups[groupIndex];
      const dayIndex = group.days.findIndex(d => d.day_id === dayId);
      if (dayIndex === -1) {
        group.days.push({
          day_id: dayId,
          hours: [{ hour_id: hourId, lessons: [lesson] }],
        });
      } else {
        const day = group.days[dayIndex];
        const hourIndex = day.hours.findIndex(h => h.hour_id === hourId);
        if (hourIndex === -1) {
          day.hours.push({
            hour_id: hourId,
            lessons: [lesson],
          });
        } else {
          day.hours[hourIndex].lessons.push(lesson);
        }
      }
      return newData;
    });
  };

  const editLesson = (
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number,
    updatedLesson: Lesson
  ) => {
    setScheduleData(prevData => {
      const newData = { ...prevData };
      const groupIndex = newData.faculty.groups.findIndex(g => g.group_id === groupId);
      if (groupIndex === -1) return prevData;
      const group = newData.faculty.groups[groupIndex];
      const dayIndex = group.days.findIndex(d => d.day_id === dayId);
      if (dayIndex === -1) return prevData;
      const day = group.days[dayIndex];
      const hourIndex = day.hours.findIndex(h => h.hour_id === hourId);
      if (hourIndex === -1) return prevData;
      const hour = day.hours[hourIndex];
      if (lessonIndex < 0 || lessonIndex >= hour.lessons.length) return prevData;
      hour.lessons[lessonIndex] = updatedLesson;
      return newData;
    });
  };

  const deleteLesson = (
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number
  ) => {
    setScheduleData(prevData => {
      const newData = { ...prevData };
      const groupIndex = newData.faculty.groups.findIndex(g => g.group_id === groupId);
      if (groupIndex === -1) return prevData;
      const group = newData.faculty.groups[groupIndex];
      const dayIndex = group.days.findIndex(d => d.day_id === dayId);
      if (dayIndex === -1) return prevData;
      const day = group.days[dayIndex];
      const hourIndex = day.hours.findIndex(h => h.hour_id === hourId);
      if (hourIndex === -1) return prevData;
      const hour = day.hours[hourIndex];
      if (lessonIndex < 0 || lessonIndex >= hour.lessons.length) return prevData;
      hour.lessons.splice(lessonIndex, 1);
      if (hour.lessons.length === 0) {
        day.hours.splice(hourIndex, 1);
        if (day.hours.length === 0) {
          group.days.splice(dayIndex, 1);
        }
      }
      return newData;
    });
  };

  const toggleBlockStatus = (
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number
  ) => {
    setScheduleData(prevData => {
      const newData = { ...prevData };
      const groupIndex = newData.faculty.groups.findIndex(g => g.group_id === groupId);
      if (groupIndex === -1) return prevData;
      const group = newData.faculty.groups[groupIndex];
      const dayIndex = group.days.findIndex(d => d.day_id === dayId);
      if (dayIndex === -1) return prevData;
      const day = group.days[dayIndex];
      const hourIndex = day.hours.findIndex(h => h.hour_id === hourId);
      if (hourIndex === -1) return prevData;
      const hour = day.hours[hourIndex];
      if (lessonIndex < 0 || lessonIndex >= hour.lessons.length) return prevData;
      hour.lessons[lessonIndex].blocked = !hour.lessons[lessonIndex].blocked;
      return newData;
    });
  };

  const value: ScheduleContextType = {
    scheduleData,
    setScheduleData,
    addLesson,
    editLesson,
    deleteLesson,
    toggleBlockStatus,
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};