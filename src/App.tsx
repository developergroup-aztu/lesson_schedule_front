import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Wellcome from './pages/Wellcome/Wellcome';

import Loader from './common/Loader';
import DefaultLayout from './layout/DefaultLayout';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/Common/404';

// Auth Pages
import SignIn from './pages/Authentication/SignIn';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import VerifyCode from './pages/Authentication/VerifyCode';
import ResetPassword from './pages/Authentication/ResetPassword';

// Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/User/Profile';

// User Management Pages
import UsersTable from './pages/User/UsersTable';
import AddNewUser from './pages/User/AddNewUser';
import EditUser from './pages/User/EditUser';
import UserViewPage from './pages/User/UserViewPage';

// Role & Permission Pages
import RoleTable from './pages/Role Permissions/Role';
import AddRole from './pages/Role Permissions/AddRole';
import EditRole from './pages/Role Permissions/EditRole';
import PermissionsTable from './pages/Role Permissions/PermissionsTable';

import Rooms from './pages/Room/Rooms';
import Teachers from './pages/Teachers/Teachers';
import TeacherSchedule from './pages/Teachers/TeachersSchedule';

// Schedule Pages
import Schedule from './pages/Schedule/Schedule';
import FacultiesSchedule from './pages/Schedule/FacultiesSchedule';
import RoomSchedule from './pages/Room/RoomSchedule';

import MergeGroups from './pages/Merge/MergeGroups';

import { ScheduleProvider } from './context/ScheduleContext';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <AuthProvider>
      {loading ? (
        <Loader />
      ) : (
        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={<Wellcome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <Routes>
                    {/* Common Pages */}
                    <Route path="*" element={<NotFound />} />
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="forms/form-elements" />

                    {/* User Management Routes */}
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute requiredPermission="view_users">
                          <UsersTable />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users/add"
                      element={
                        <ProtectedRoute requiredPermission="add_user">
                          <AddNewUser />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/users/edit/:id"
                      element={
                        <ProtectedRoute requiredPermission="edit_user">
                          <EditUser />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users/view/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_user">
                          <UserViewPage />
                        </ProtectedRoute>
                      }
                    />


                    {/* Role & Permission Routes */}
                    <Route
                      path="roles"
                      element={
                        <ProtectedRoute requiredPermission="view_roles">
                          <RoleTable />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/roles/add"
                      element={
                        <ProtectedRoute requiredPermission="add_role">
                          <AddRole />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/roles/edit/:id"
                      element={
                        <ProtectedRoute requiredPermission="edit_role">
                          <EditRole />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="permissions"
                      element={
                        <ProtectedRoute requiredPermission="view_permissions">
                          <PermissionsTable />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="rooms"
                      element={
                        <ProtectedRoute requiredPermission="view_rooms">
                          <Rooms />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="teachers"
                      element={
                        <ProtectedRoute requiredPermission="view_teachers">
                          <Teachers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/teachers/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_teacher_schedule">
                          <TeacherSchedule />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/rooms/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_room_schedule">
                          <RoomSchedule />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="schedules"
                      element={
                        <ProtectedRoute requiredPermission="view_schedules">
                          <ScheduleProvider>
                            <Schedule />
                          </ScheduleProvider>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/faculties"
                      element={
                        <ProtectedRoute requiredPermission="view_faculties">
                          <FacultiesSchedule />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/merge-groups"
                      element={
                        <ProtectedRoute>
                          <MergeGroups />
                        </ProtectedRoute>
                      }
                    />



                    <Route
                      path="/faculties/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_faculty_schedule">
                          <ScheduleProvider>
                            <Schedule />
                          </ScheduleProvider>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </DefaultLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </AuthProvider>
  );
}

export default App;
