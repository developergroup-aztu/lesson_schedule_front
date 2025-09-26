import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  UserRound,
  GraduationCap,
  X,
  Building,
  BookOpenCheck
} from 'lucide-react';
import { get } from '../../api/service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (progress < duration) {
        setCount(Math.floor((progress / duration) * end));
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}</span>;
};

const LoadingDashboardCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center">
      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4 animate-pulse">
        <div className="w-6 h-6 rounded-full bg-blue-300 dark:bg-blue-700"></div>
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
    </div>
  );
};

const DashboardCard = ({ title, count, icon: Icon, onClick, clickable }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center 
        ${clickable ? 'cursor-pointer hover:shadow-lg transition-shadow dark:hover:shadow-gray-700' : ' select-none'}`}
      onClick={clickable ? onClick : undefined}
      tabIndex={clickable ? 0 : -1}
      aria-disabled={!clickable}
    >
      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4">
        <Icon size={24} className="text-blue-600 dark:text-blue-300" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
      <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
        <Counter end={count} />
      </p>
    </div>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    faculty_count: 0,
    department_count: 0,
    group_count: 0,
    room_count: 0,
    teacher_count: 0,
    user_count: 0,
    speciality_count: 0
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  // FacultyAdmin isə heç bir card kliklənməsin
  const isFacultyAdmin = user?.roles?.includes('FacultyAdmin');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await get('/api/dashboard');
        setData(response.data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="h-[80vh]">
      <div className="mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <LoadingDashboardCard />
              <LoadingDashboardCard />
              <LoadingDashboardCard />
              <LoadingDashboardCard />
              <LoadingDashboardCard />
              <LoadingDashboardCard />
            </>
          ) : (
            <>
              <DashboardCard
                title="Fakültələr"
                count={data.faculty_count}
                icon={Building2}
                onClick={() => navigate('/faculties')}
                clickable={!isFacultyAdmin}
              />
              <DashboardCard
                title="Qruplar"
                count={data.group_count}
                icon={Users}
                clickable={!isFacultyAdmin}
              />
              <DashboardCard
                title="Otaqlar"
                count={data.room_count}
                icon={Building}
                onClick={() => navigate('/rooms')}
                clickable={!isFacultyAdmin}
              />
              <DashboardCard
                title="Müəllimlər"
                count={data.teacher_count}
                icon={BookOpen}
                onClick={() => navigate('/teachers')}
                clickable={!isFacultyAdmin}
              />
              <DashboardCard
                title="İstifadəçilər"
                count={data.user_count}
                icon={UserRound}
                onClick={() => navigate('/users')}
                clickable={!isFacultyAdmin}
              />
              <DashboardCard
                title="Dərslər"
                count={data.lesson_count}
                icon={BookOpenCheck}
                clickable={!isFacultyAdmin}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}