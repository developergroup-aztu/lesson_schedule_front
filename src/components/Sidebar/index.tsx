import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../../images/Logo.png';
import usePermissions from '../../hooks/usePermissions';
import { CiViewTable } from 'react-icons/ci';
import { RiUserSettingsLine } from 'react-icons/ri';
import { GiCalendarHalfYear, GiSettingsKnobs } from 'react-icons/gi';
import { LiaSwatchbookSolid, LiaUniversitySolid } from 'react-icons/lia';
import { SiGoogleclassroom } from 'react-icons/si';
import { RiListSettingsFill } from 'react-icons/ri';
import { IoBookOutline } from 'react-icons/io5';
import { PiStairsThin } from 'react-icons/pi';
import {
  MdGroups,
  MdOutlineCalendarToday,
  MdOutlineMeetingRoom,
} from 'react-icons/md';
import { FaDropbox } from 'react-icons/fa';
import { MdRoomPreferences } from 'react-icons/md';
import { MdOutlineWatchLater } from 'react-icons/md';
import { useAuth } from '../../Context/AuthContext';
import { CgProfile } from 'react-icons/cg';


interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const hasShowUsers = usePermissions('view_users');
  const hasShowRoles = usePermissions('view_roles');
  const hasShowPermissions = usePermissions('view_permissions');
  const hasShowFaculties = usePermissions('view_faculties');
  const hasShowDepartments = usePermissions('view_departments');
  const hasShowSpecialities = usePermissions('view_specialities');
  const hasShowCourses = usePermissions('view_courses');
  const hasShowLessonTypes = usePermissions('view_lesson_types');
  const hasShowDisciplines = usePermissions('view_disciplines');
  const hasShowGroups = usePermissions('view_groups');
  const hasShowCorps = usePermissions('view_corps');
  const hasShowRoomTypes = usePermissions('view_room_types');
  const hasShowRooms = usePermissions('view_rooms');
  const hasShowSemesters = usePermissions('view_semesters');
  const hasShowWeekTypes = usePermissions('view_week_types');
  const hasShowHours = usePermissions('view_hours');
  const hasShowSchedules = usePermissions('view_schedules');
  const hasRoomPermissions = usePermissions('view_room_permissions');

  const {user} = useAuth()

  const isTeacher = user?.roles.includes("teacher")

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute bg-white shadow-lg left-0 top-0 z-9999 md:z-0 flex h-screen w-72.5 flex-col overflow-y-hidden  duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <div className="flex gap-1 font-bold dark:text-white text-[#0D1F61]">
            <img src={Logo} alt="" className="h-9" />
            <div className="text-sm">
              <p>AzTU elektron</p>
              <p>cədvəl</p>
            </div>
          </div>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* <!-- Menu Item Dashboard --> */}
              <li>
                <NavLink
                  to="/"
                  className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                    pathname === '/' && 'bg-[#d4e4ff] dark:bg-meta-4'
                  }`}
                >
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299ZM6.60947 6.30005C6.60947 6.5813 6.38447 6.8063 6.10322 6.8063H2.53135C2.2501 6.8063 2.0251 6.5813 2.0251 6.30005V2.72817C2.0251 2.44692 2.2501 2.22192 2.53135 2.22192H6.10322C6.38447 2.22192 6.60947 2.44692 6.60947 2.72817V6.30005Z"
                      fill=""
                    ></path>
                    <path
                      d="M15.4689 0.956299H11.8971C10.9408 0.956299 10.1533 1.7438 10.1533 2.70005V6.27192C10.1533 7.22817 10.9408 8.01567 11.8971 8.01567H15.4689C16.4252 8.01567 17.2127 7.22817 17.2127 6.27192V2.72817C17.2127 1.7438 16.4252 0.956299 15.4689 0.956299ZM15.9752 6.30005C15.9752 6.5813 15.7502 6.8063 15.4689 6.8063H11.8971C11.6158 6.8063 11.3908 6.5813 11.3908 6.30005V2.72817C11.3908 2.44692 11.6158 2.22192 11.8971 2.22192H15.4689C15.7502 2.22192 15.9752 2.44692 15.9752 2.72817V6.30005Z"
                      fill=""
                    ></path>
                    <path
                      d="M6.10322 9.92822H2.53135C1.5751 9.92822 0.787598 10.7157 0.787598 11.672V15.2438C0.787598 16.2001 1.5751 16.9876 2.53135 16.9876H6.10322C7.05947 16.9876 7.84697 16.2001 7.84697 15.2438V11.7001C7.8751 10.7157 7.0876 9.92822 6.10322 9.92822ZM6.60947 15.272C6.60947 15.5532 6.38447 15.7782 6.10322 15.7782H2.53135C2.2501 15.7782 2.0251 15.5532 2.0251 15.272V11.7001C2.0251 11.4188 2.2501 11.1938 2.53135 11.1938H6.10322C6.38447 11.1938 6.60947 11.4188 6.60947 11.7001V15.272Z"
                      fill=""
                    ></path>
                    <path
                      d="M15.4689 9.92822H11.8971C10.9408 9.92822 10.1533 10.7157 10.1533 11.672V15.2438C10.1533 16.2001 10.9408 16.9876 11.8971 16.9876H15.4689C16.4252 16.9876 17.2127 16.2001 17.2127 15.2438V11.7001C17.2127 10.7157 16.4252 9.92822 15.4689 9.92822ZM15.9752 15.272C15.9752 15.5532 15.7502 15.7782 15.4689 15.7782H11.8971C11.6158 15.7782 11.3908 15.5532 11.3908 15.272V11.7001C11.3908 11.4188 11.6158 11.1938 11.8971 11.1938H15.4689C15.7502 11.1938 15.9752 11.4188 15.9752 11.7001V15.272Z"
                      fill=""
                    ></path>
                  </svg>
                  Dashboard
                </NavLink>
              </li>
              {hasShowSchedules && (
                <li>
                  <NavLink
                    to="/schedules"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/schedules' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <CiViewTable size={25} />
                    Cədvəl
                  </NavLink>
                </li>
              )}

              {hasShowRooms && (
                <li>
                  <NavLink
                    to="/rooms"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/rooms' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <MdOutlineMeetingRoom size={25} />
                    Otaqlar
                  </NavLink>
                </li>
              )} 

               {hasShowUsers && (
                <li>
                  <NavLink
                    to="/users"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/users' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                    İstifadəçilər
                  </NavLink>
                </li>
              )}
              {hasShowRoles && (
                <li>
                  <NavLink
                    to="/roles"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/roles' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <RiUserSettingsLine size={25} />
                    Rollar
                  </NavLink>
                </li>
              )}
              {hasShowPermissions && (
                <li>
                  <NavLink
                    to="/permissions"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/permissions' &&
                      'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <GiSettingsKnobs size={24} />
                    İcazələr
                  </NavLink>
                </li>
              )}
                            {/* {hasShowFaculties && (
                <li>
                  <NavLink
                    to="/faculties"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/faculties' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <LiaUniversitySolid size={25} />
                    Fakültələr
                  </NavLink>
                </li>
              )} */}
               {/* <li>
                  <NavLink
                    to="/profile"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/profile' &&
                      'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <CgProfile size={24} />
                    Profil
                  </NavLink>
                </li> */}
                       {/* {hasShowDepartments && (
                <li>
                  <NavLink
                    to="/department"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/department' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <SiGoogleclassroom size={25} />
                    Kafedra
                  </NavLink>
                </li>
              )} */}
             
              {/* {hasShowLessonTypes && (
                <li>
                  <NavLink
                    to="/lesson-type"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/lesson-type' &&
                      'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <IoBookOutline size={25} />
                    Dərs tipi
                  </NavLink>
                </li>
              )}
              
              {hasShowCourses && (
                <li>
                  <NavLink
                    to="/course"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/course' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <PiStairsThin size={25} />
                    Kurs
                  </NavLink>
                </li>
              )}

              {hasShowCorps && (
                <li>
                  <NavLink
                    to="/corps"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/corps' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <FaDropbox size={25} />
                    Korpuslar
                  </NavLink>
                </li>
              )}
                            {hasShowRoomTypes && (
                <li>
                  <NavLink
                    to="/room-types"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/room-types' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <MdRoomPreferences size={25} />
                    Otaq tipləri
                  </NavLink>
                </li>
              )} */}
              {/* {hasShowRooms && (
                <li>
                  <NavLink
                    to="/rooms"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/rooms' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <MdOutlineMeetingRoom size={25} />
                    Otaqlar
                  </NavLink>
                </li>
              )} */}
              {/* {
                hasRoomPermissions && (
                  <li>
                  <NavLink
                    to="/room-permissions"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/room-permissions' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <MdOutlineMeetingRoom size={25} />
                    Otaq İcazəsi
                  </NavLink>
                </li>
                )
              }
              {hasShowSemesters && (
                <li>
                  <NavLink
                    to="/semesters"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/semesters' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <GiCalendarHalfYear size={25} />
                    Semestrlər
                  </NavLink>
                </li>
              )}
              {hasShowWeekTypes && (
                <li>
                  <NavLink
                    to="/week-types"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/week-types' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <GiSettingsKnobs size={25} />
                    Həftə tipləri
                  </NavLink>
                </li>
              )} */}
              {/* {hasShowHours  && !isTeacher ? (
                <li>
                  <NavLink
                    to="/hours"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/hours' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <MdOutlineWatchLater size={25} />
                    Saatlar
                  </NavLink>
                </li>
              ) : null} */}

                {/* {hasShowSpecialities && (
                <li>
                  <NavLink
                    to="/specialities"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/specialities' &&
                      'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <RiListSettingsFill size={25} />
                    İxtisas
                  </NavLink>
                </li>
              )}  */}

              {/* {hasShowDisciplines && (
                <li>
                  <NavLink
                    to="/lessons"
                    className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-medium duration-300 ease-in-out hover:bg-[#c4d8fa] dark:hover:bg-meta-4 ${
                      pathname === '/lessons' && 'bg-[#d4e4ff] dark:bg-meta-4'
                    }`}
                  >
                    <LiaSwatchbookSolid size={25} />
                    Fənnlər
                  </NavLink>
                </li>
              )} */}

            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;



