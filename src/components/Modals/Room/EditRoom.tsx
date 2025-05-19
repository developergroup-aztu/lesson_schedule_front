import React, { useState, useEffect } from 'react';
import { get } from '../../../api/service';

interface Department {
  id: number;
  name: string;
}

interface RoomType {
  id: number;
  name: string;
}

interface Corps {
  id: number;
  name: string;
}

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    room_capacity: number,
    department_id: number,
    room_type_id: number,
    corp_id: number,
  ) => void;
  initialData: {
    id: number;
    name: string;
    room_capacity: number;
    department_id: number;
    room_type_id: number;
    corp_id: number;
  };
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData.name);
  const [roomCapacity, setRoomCapacity] = useState(initialData.room_capacity);
  const [departmentId, setDepartmentId] = useState<number | ''>(initialData.department_id);
  const [roomTypeId, setRoomTypeId] = useState<number | ''>(initialData.room_type_id);
  const [corpId, setCorpId] = useState<number | ''>(initialData.corp_id);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [corps, setCorps] = useState<Corps[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await get('/api/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    const fetchRoomTypes = async () => {
      try {
        const response = await get('/api/room_types');
        setRoomTypes(response.data);
      } catch (error) {
        console.error('Error fetching room types:', error);
      }
    };

    const fetchCorps = async () => {
      try {
        const response = await get('/api/corps');
        setCorps(response.data);
      } catch (error) {
        console.error('Error fetching corps:', error);
      }
    };

    if (isOpen) {
      fetchDepartments();
      fetchRoomTypes();
      fetchCorps();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setName(initialData.name);
      setRoomCapacity(initialData.room_capacity);
      setDepartmentId(initialData.department_id);
      setRoomTypeId(initialData.room_type_id);
      setCorpId(initialData.corp_id);
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (
      departmentId !== '' &&
      roomTypeId !== '' &&
      corpId !== ''
    ) {
      onSave(name, roomCapacity, Number(departmentId), Number(roomTypeId), Number(corpId));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-2/3 md:w-1/2 lg:w-1/3 overflow-y-auto max-h-full">
        <h2 className="text-xl font-bold mb-4">Otağı Redaktə Et</h2>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Ad
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="roomCapacity"
            className="block text-sm font-medium text-gray-700"
          >
            Otaq Tutumu
          </label>
          <input
            id="roomCapacity"
            name="roomCapacity"
            type="number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={roomCapacity}
            onChange={(e) => setRoomCapacity(Number(e.target.value))}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700"
          >
            Kafedra
          </label>
          <select
            id="department"
            name="department"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={departmentId || ''}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
          >
            <option value="">Seçin</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="roomType"
            className="block text-sm font-medium text-gray-700"
          >
            Otaq Tipi
          </label>
          <select
            id="roomType"
            name="roomType"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(Number(e.target.value))}
          >
            <option value="">Seçin</option>
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="corp"
            className="block text-sm font-medium text-gray-700"
          >
            Korpus
          </label>
          <select
            id="corp"
            name="corp"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={corpId}
            onChange={(e) => setCorpId(Number(e.target.value))}
          >
            <option value="">Seçin</option>
            {corps.map((corp) => (
              <option key={corp.id} value={corp.id}>
                {corp.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            type="button"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            onClick={handleSubmit}
          >
            Təsdiq et
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoomModal;