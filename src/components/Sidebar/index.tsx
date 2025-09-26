import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  Calendar,
  CaseSensitive as University,
  SquareUser,
  Building2,
  ListChecks,
  School,
  Layers,
  Box,
  Home,
  Clock,
  Landmark,
  UserCheck,
  GroupIcon,
  Merge,
  Printer,
} from 'lucide-react';
import Logo from '../../images/Logo.png';
import { LiaChalkboardTeacherSolid } from "react-icons/lia";

import { useAuth } from '../../Context/AuthContext';
// Import the usePermissions hook
import usePermissions from '../../hooks/usePermissions'; 
import { BiGroup } from 'react-icons/bi';
import path from 'path';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  // State for collapsed sidebar view
  const [collapsed, setCollapsed] = useState(false);

  // Get stored sidebar state from localStorage if available
  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  const { user } = useAuth(); // You still need user for roles if your permissions depend on them implicitly, but not directly for menu visibility here.

  const canViewDashboard = usePermissions('view_dashboards');
  const canViewFaculties = usePermissions('view_faculties');
  const canViewSchedules = usePermissions('view_schedules'); 
  const canViewRooms = usePermissions('view_rooms');
  const canViewTeachers = usePermissions('view_teachers');
  const canViewUsers = usePermissions('view_users');
  const canViewRoles = usePermissions('view_roles');
  const canViewPermissions = usePermissions('view_permissions');
  const canViewPrints = usePermissions('view_prints');
  const canViewMergeGroups = usePermissions('view_group_merges');

  // Close on click outside
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

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed.toString());
  }, [collapsed]);

  // Menu items structure with icons and paths
  // Now, 'permission' property directly uses the boolean returned by usePermissions
  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 " />,
      permission: canViewDashboard, 
    },
    {
      path: '/faculties',
      label: 'Fakültələr',
      icon: <School className="w-5 h-5" />,
      permission: canViewFaculties, 
    },
    {
      path: '/schedules',
      label: 'Cədvəl',
      icon: <Calendar className="w-5 h-5" />,
      permission: canViewSchedules, // Assuming you'll add a 'view_schedules' permission
    },
        {
      path: '/merge-groups',
      label: 'Qrup birləşdirmə',
      icon: <Merge className="w-5 h-5" />,
      permission: canViewMergeGroups, // Assuming all authenticated users can access this
    },
    {
      path: '/rooms',
      label: 'Otaqlar',
      icon: <Building2 className="w-5 h-5" />,
      permission: canViewRooms, 
    },
    {
      path: '/teachers',
      label: 'Müəllimlər',
      icon: <LiaChalkboardTeacherSolid className="w-5 h-5" />,
      permission: canViewTeachers, 
    },
    {
      path: '/users',
      label: 'İstifadəçilər',
      icon: <Users className="w-5 h-5" />,
      permission: canViewUsers, 
    },
    {
      path: '/roles',
      label: 'Rollar',
      icon: <SquareUser className="w-5 h-5" />,
      permission: canViewRoles, 
    },
    {
      path: '/permissions',
      label: 'İcazələr',
      icon: <Settings className="w-5 h-5" />,
      permission: canViewPermissions, 
    },
    {
      path: '/prints',
      label: 'Çap',
      icon: <Printer className="w-5 h-5" />,
      permission: canViewPrints, // Assuming all authenticated users can access this
    }
  ];

  return (
    <aside
      ref={sidebar}
      className={`fixed bg-white shadow-lg left-0 top-0 z-20 flex h-screen 
      ${collapsed ? 'w-20' : 'w-72.5'} flex-col overflow-y-hidden 
      duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div
        className={`flex items-center justify-between ${collapsed ? 'px-2 py-5.5' : 'px-6 py-5.5'
          } lg:py-6`}
      >
        {!collapsed && (
          <NavLink
            to="/dashboard"
            className="flex gap-1 font-bold dark:text-white text-[#0D1F61]"
          >
            <img src={Logo} alt="" className="h-9" />
            <div className="text-sm">
              <p>AzTU elektron</p>
              <p>cədvəl</p>
            </div>
          </NavLink>
        )}

        {collapsed && (
          <NavLink to="/dashboard" className="mx-auto">
            <img src={Logo} alt="" className="h-9" />
          </NavLink>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`${collapsed ? 'mx-auto mt-2' : ''
            } hidden lg:block hover:bg-gray-100 p-1 rounded-md transition-colors`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className={`block lg:hidden ${collapsed ? 'mx-auto' : ''}`}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav
          className={`mt-5 py-4 ${collapsed ? 'px-2' : 'px-4'} lg:mt-9 lg:px-6`}
        >
          <div>
            {!collapsed && (
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                MENU
              </h3>
            )}

            <ul className="mb-6 flex flex-col gap-1.5">
              {menuItems.map(
                (item, index) =>
                  item.permission && ( // This line conditionally renders the menu item
                    <li key={index}>
                      <NavLink
                        to={item.path}
                        className={`group relative flex items-center gap-2.5 rounded-lg py-2 
            ${collapsed ? 'px-2 justify-center' : 'px-4'}
            font-medium duration-300 
            ease-in-out hover:bg-indigo-700 hover:text-white  dark:hover:bg-meta-4 
            ${item.path === '/'
                                ? pathname === '/'
                                  ? 'bg-indigo-600 dark:bg-meta-4 text-white'
                                  : ''
                                : pathname.startsWith(item.path)
                                  ? 'bg-indigo-600 dark:bg-meta-4 text-white'
                                  : ''
                              }
          `}
                      >
                        {item.icon && (
                          <span className={'w-5 h-5'}>{item.icon}</span>
                        )}
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    </li>
                  ),
              )}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;