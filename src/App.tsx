import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import DefaultLayout from './layout/DefaultLayout';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Forbidden from './pages/Common/Forbidden';
import NotFound from './pages/Common/404';

// Auth Pages
import SignIn from './pages/Authentication/SignIn';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import VerifyCode from './pages/Authentication/VerifyCode';
import ResetPassword from './pages/Authentication/ResetPassword';

// Dashboard Pages
import ECommerce from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';

// User Management Pages
import UsersTable from './pages/UsersTable';
import AddNewUser from './pages/AddNewUser';
import EditUser from './pages/EditUser';
import UserViewPage from './pages/UserViewPage';

// Role & Permission Pages
import Role from './pages/Role';
import AddRole from './pages/AddRole';
import EditRole from './pages/EditRole';
import PermissionsTable from './pages/PermissionsTable';
import RoomPermissions from './pages/RoomPermissions';
import DetailsRoomPermission from './pages/DetailsRoomPermission';

// Faculty & Department Pages
import FacultyPage from './pages/Faculty';
import DepartmentPage from './pages/Department';
import FacultyDetails from './pages/FacultyDetails';
import DeparmentDetails from './pages/DeparmentDetails';

// Academic Pages
import CoursePage from './pages/CoursePage';
import Specialities from './pages/Specialities';
import SpecialityDetails from './pages/SpecialityDetails';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import LessonsType from './pages/LessonType';
import Lessons from './pages/Lessons';
import WeekTypes from './pages/WeekTypes';
import Smestrs from './pages/Semestrs';

// Facility Pages
import Corps from './pages/Corps';
import RoomType from './pages/RoomType';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';

// Schedule Pages
import Hours from './pages/Hours';
import Schedule from './pages/Schedule';
import AddScheduleLesson from './pages/AddScheduleLesson';
import EditLessonInShedule from './pages/EditLessonInShedule';

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
                    <Route path="settings" element={<Settings />} />
                    <Route path="tables" element={<Tables />} />
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
                      path="add-new-user"
                      element={
                        <ProtectedRoute requiredPermission="add_user">
                          <AddNewUser />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="edit-user/:id"
                      element={
                        <ProtectedRoute requiredPermission="edit_user">
                          <EditUser />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="view-user/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_user">
                          <UserViewPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Role & Permission Routes */}
                    <Route
                      path="role"
                      element={
                        <ProtectedRoute requiredPermission="view_roles">
                          <Role />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="add-role"
                      element={
                        <ProtectedRoute requiredPermission="add_role">
                          <AddRole />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="edit-role/:id"
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
                      path="room-permissions"
                      element={
                        <ProtectedRoute requiredPermission="view_room_permissions">
                          <RoomPermissions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="room-permissions/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_room_permission">
                          <DetailsRoomPermission />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Faculty & Department Routes */}
                    <Route
                      path="faculty"
                      element={
                        <ProtectedRoute requiredPermission="view_faculties">
                          <FacultyPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="department"
                      element={
                        <ProtectedRoute requiredPermission="view_departments">
                          <DepartmentPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="departments/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_department">
                          <DeparmentDetails />
                        </ProtectedRoute>
                      }
                    /> */}
                    
                    {/* Academic Routes */}
                    <Route
                      path="course"
                      element={
                        <ProtectedRoute requiredPermission="view_courses">
                          <CoursePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="specialities"
                      element={
                        <ProtectedRoute requiredPermission="view_specialities">
                          <Specialities />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="specialities/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_speciality">
                          <SpecialityDetails />
                        </ProtectedRoute>
                      }
                    /> */}
                    <Route
                      path="groups"
                      element={
                        <ProtectedRoute requiredPermission="view_groups">
                          <Groups />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="groups/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_group">
                          <GroupDetails />
                        </ProtectedRoute>
                      }
                    /> */}
                    <Route
                      path="lesson-type"
                      element={
                        <ProtectedRoute requiredPermission="view_lesson_types">
                          <LessonsType />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="lessons"
                      element={
                        <ProtectedRoute requiredPermission="view_disciplines">
                          <Lessons />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="week-types"
                      element={
                        <ProtectedRoute requiredPermission="view_week_types">
                          <WeekTypes />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="semesters"
                      element={
                        <ProtectedRoute requiredPermission="view_semesters">
                          <Smestrs />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Facility Routes */}
                    <Route
                      path="corps"
                      element={
                        <ProtectedRoute requiredPermission="view_corps">
                          <Corps />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="room-types"
                      element={
                        <ProtectedRoute requiredPermission="view_room_types">
                          <RoomType />
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
                    {/* <Route
                      path="rooms/:id"
                      element={
                        <ProtectedRoute requiredPermission="view_room">
                          <RoomDetails />
                        </ProtectedRoute>
                      }
                    /> */}
                    
                    {/* Schedule Routes */}
                    <Route
                      path="hours"
                      element={
                        <ProtectedRoute requiredPermission="view_hours">
                          <Hours />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="schedule"
                      element={
                        <ProtectedRoute requiredPermission="view_schedules">
                          <Schedule />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="add-schedule-lesson"
                      element={
                        <ProtectedRoute requiredPermission="add_schedule">
                          <AddScheduleLesson />
                        </ProtectedRoute>
                      }
                    />
                    {/* <Route
                      path="schedule-lesson/:id"
                      element={
                        <ProtectedRoute requiredPermission="edit_schedule">
                          <EditLessonInShedule />
                        </ProtectedRoute>
                      }
                    /> */}
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