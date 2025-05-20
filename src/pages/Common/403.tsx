import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const Forbidden: React.FC = () => {
  return (
    <div className=" min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="bg-white p-8 rounded-lg-lg flex justify-center items-center flex-col shadow-md dark:bg-gray-800">
        <FiAlertTriangle size={40} className="text-[red] mb-2" />

        <h1 className="text-3xl font-bold mb-2">403 - Forbidden</h1>
        <p className="text-gray-700">Bu səhifəyə icazəniz yoxdur.</p>
      </div>
    </div>
  );
};

export default Forbidden;
