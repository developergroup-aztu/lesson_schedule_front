import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

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
import ECommerce from './pages/Dashboard/Dashboard';
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

// Schedule Pages
import Schedule from './pages/Schedule/Schedule';
import AddScheduleLesson from './pages/Schedule/AddScheduleLesson';
import FacultiesSchedule from './pages/Schedule/FacultiesSchedule';
import RoomSchedule from './pages/Room/RoomSchedule';

import { ScheduleProvider } from './Context/ScheduleContext';

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
                    <Route index element={<ECommerce />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="forms/form-elements" />

                    {/* User Management Routes */}
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute requiredPermission="view_users">
                          <UsersTable />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user/add"
                      element={
                        <ProtectedRoute requiredPermission="add_user">
                          <AddNewUser />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user/edit/:id"
                      element={
                        <ProtectedRoute requiredPermission="edit_user">
                          <EditUser />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user/view/:id"
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
                      path="/role/add"
                      element={
                        <ProtectedRoute requiredPermission="add_role">
                          <AddRole />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/role/edit/:id"
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
                      path="/room/:id/schedule"
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
                      path="/schedule/add"
                      element={
                        <ProtectedRoute requiredPermission="add_schedule">
                          <AddScheduleLesson />
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
                      path="/faculty/:id/schedule"
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
