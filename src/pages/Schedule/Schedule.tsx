import React, { useState } from 'react';
import { ScheduleProvider } from '../../Context/ScheduleContext';
import Header from '../../components/Header';
import ScheduleTable from '../../components/ScheduleTable/ScheduleTable';
import LessonModal from '../../components/LessonModal';
import ContextMenu from '../../components/ContextMenu';

function Schedule() {
  const [modalData, setModalData] = useState({
    isOpen: false,
    groupId: null,
    dayId: null,
    hourId: null,
    lessonIndex: null,
    lesson: null,
    mode: 'add'
  });

  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    groupId: null as number | null,
    dayId: null as number | null,
    hourId: null as number | null,
    lessonIndex: null as number | null
  });

  const handleAddLesson = (
    groupId: number, 
    dayId: number, 
    hourId: number,
    weekTypeId: number = 1
  ) => {
    setModalData({
      isOpen: true,
      groupId,
      dayId,
      hourId,
      lessonIndex: weekTypeId, 
      lesson: null,
      mode: 'add'
    });
  };

  const handleEditLesson = (
    groupId: number, 
    dayId: number, 
    hourId: number, 
    lessonIndex: number
  ) => {
    setModalData({
      isOpen: true,
      groupId,
      dayId,
      hourId,
      lessonIndex,
      lesson: null, 
      mode: 'edit'
    });
  };

  const handleOpenContextMenu = (
    e: React.MouseEvent,
    groupId: number,
    dayId: number,
    hourId: number,
    lessonIndex: number
  ) => {
    e.preventDefault();
    
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      groupId,
      dayId,
      hourId,
      lessonIndex
    });
  };

  const handleCloseModal = () => {
    setModalData(prev => ({ ...prev, isOpen: false }));
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleEditFromContextMenu = () => {
    if (
      contextMenu.groupId !== null &&
      contextMenu.dayId !== null &&
      contextMenu.hourId !== null &&
      contextMenu.lessonIndex !== null
    ) {
      handleEditLesson(
        contextMenu.groupId,
        contextMenu.dayId,
        contextMenu.hourId,
        contextMenu.lessonIndex
      );
    }
  };

  return (
    <ScheduleProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onAddLesson={() => handleAddLesson(1, 1, 1)} />
        
        <main className="flex-1  print:p-0">
          <div className="bg-white shadow-md rounded-lg overflow-hidden print:shadow-none print:rounded-none">
            <ScheduleTable
              onAddLesson={handleAddLesson}
              onOpenContextMenu={handleOpenContextMenu}
              onEditLesson={handleEditLesson}
            />
          </div>
        </main>

        <LessonModal
          isOpen={modalData.isOpen}
          onClose={handleCloseModal}
          modalData={modalData}
        />

        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
          groupId={contextMenu.groupId}
          dayId={contextMenu.dayId}
          hourId={contextMenu.hourId}
          lessonIndex={contextMenu.lessonIndex}
          onEdit={handleEditFromContextMenu}
        />
      </div>
    </ScheduleProvider>
  );
}

export default Schedule;