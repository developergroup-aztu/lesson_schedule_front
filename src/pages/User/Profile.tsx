import React, { useState } from 'react';
import { Pencil, Check, X, User } from 'lucide-react';

// Mock user data - replace with actual useAuth() implementation
const user = {
  email: "ehmedovaleyla@gmail.com",
  name: "Leyla",
  roles: ["SuperAdmin"]
};

function Profile() {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);

  const handleSaveName = () => {
    // Here you would typically make an API call to update the name
    setIsEditingName(false);
  };

  const handleSaveEmail = () => {
    // Here you would typically make an API call to update the email
    setIsEditingEmail(false);
  };

  return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full">
                <User className="w-12 h-12 text-blue-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                <p className="text-blue-100">Manage your account settings</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Name</label>
                <div className="flex items-center space-x-2">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-medium">{editedName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isEditingName ? (
                  <>
                    <button
                      onClick={handleSaveName}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(user.name);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center space-x-2">
                  {isEditingEmail ? (
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-medium">{editedEmail}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isEditingEmail ? (
                  <>
                    <button
                      onClick={handleSaveEmail}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingEmail(false);
                        setEditedEmail(user.email);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Role Information */}
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-gray-500">Role</label>
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {user.roles[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Profile;