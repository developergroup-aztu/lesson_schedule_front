import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="text-indigo-600 font-medium text-lg">Profil məlumatları yüklənir...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <Breadcrumb pageName="Profilim" />

      <div className="bg-white rounded-2xl shadow border border-indigo-100 p-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name} {user.surname}</h2>
        <p className="text-gray-600 text-base mb-4">{user.email}</p>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {user.roles?.map((role) => (
            <span
              key={role}
              className="bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-xs font-semibold"
            >
              {role}
            </span>
          ))}
        </div>
        {user.faculty_name && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium text-indigo-700">Fakültə:</span> {user.faculty_name}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;