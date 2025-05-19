import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  BookOpen, 
  UserRound, 
  GraduationCap,
  X,
  Building
} from 'lucide-react';
import {get} from '../../api/service';

// Fake data
const fakeData = {
  faculties: [
    { id: 1, name: "Engineering", departments: 5, students: 1250 },
    { id: 2, name: "Medicine", departments: 3, students: 980 },
    { id: 3, name: "Business", departments: 4, students: 1100 },
    { id: 4, name: "Science", departments: 6, students: 870 },
    { id: 5, name: "Arts & Humanities", departments: 5, students: 760 }
  ],
  departments : [
    { id: 1, name: "Computer Science", faculty: "Engineering", students: 300 },
    { id: 2, name: "Mechanical Engineering", faculty: "Engineering", students: 250 },
    { id: 3, name: "Medicine", faculty: "Medicine", students: 200 },
    { id: 4, name: "Business Administration", faculty: "Business", students: 400 },
    { id: 5, name: "Physics", faculty: "Science", students: 150 },
  ],
  groups: [
    { id: 1, name: "ENG-101", faculty: "Engineering", students: 25 },
    { id: 2, name: "MED-201", faculty: "Medicine", students: 30 },
    { id: 3, name: "BUS-301", faculty: "Business", students: 35 },
    { id: 4, name: "SCI-401", faculty: "Science", students: 28 },
    { id: 5, name: "ART-501", faculty: "Arts & Humanities", students: 32 }
  ],
  subjects: [
    { id: 1, name: "Calculus", faculty: "Engineering"},
    { id: 2, name: "Anatomy", faculty: "Medicine"},
    { id: 3, name: "Marketing", faculty: "Business"},
    { id: 4, name: "Physics", faculty: "Science"},
    { id: 5, name: "Literature", faculty: "Arts & Humanities" }
  ],
  users: [
    { id: 1, name: "Jane Doe", role: "Student", faculty: "Engineering" },
    { id: 2, name: "John Smith", role: "Professor", faculty: "Medicine" },
    { id: 3, name: "Emily Johnson", role: "Student", faculty: "Business" },
    { id: 4, name: "Michael Brown", role: "Admin", faculty: "" },
    { id: 5, name: "Sarah Davis", role: "Professor", faculty: "Science" }
  ],
  specialties: [
    { id: 1, name: "Software Engineering", faculty: "Engineering", students: 320 },
    { id: 2, name: "Surgery", faculty: "Medicine", students: 180 },
    { id: 3, name: "Finance", faculty: "Business", students: 250 },
    { id: 4, name: "Astrophysics", faculty: "Science", students: 120 },
    { id: 5, name: "Art History", faculty: "Arts & Humanities", students: 150 }
  ]
};

const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame : number;
    
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

const Modal = ({ title, data, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(data[0]).map(key => (
                  key !== 'id' && (
                    <th 
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  )
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(item => (
                <tr key={item.id}>
                  {Object.entries(item).map(([key, value]) => (
                    key !== 'id' && (
                      <td 
                        key={key} 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {value }
                      </td>
                    )
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};




// Yukleme karti
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

const DashboardCard = ({ title, count, icon: Icon, onClick }) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow dark:hover:shadow-gray-700"
      onClick={onClick}
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
    discipline_count: 0,
    user_count: 0,
    speciality_count: 0
  });

  const [modalData, setModalData] = useState({
    isOpen: false,
    title: '',
    data: []
  });

  const openModal = (title, data) => {
    setModalData({
      isOpen: true,
      title,
      data
    });
  };

  const closeModal = () => {
    setModalData({
      ...modalData,
      isOpen: false
    });
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await get('/api/dashboard');
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="h-[80vh]">
      <div className="max-w-7xl mx-auto">
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
                title="Fakultələr"
                count={data.faculty_count}
                icon={Building2}
                onClick={() => openModal('Fakultələr', fakeData.faculties)}
              />

              <DashboardCard
                title="Kafedralar"
                count={data.department_count}
                icon={Building}
                onClick={() => openModal('Kafedralar', fakeData.departments)}
              />

              <DashboardCard
                title="Qruplar"
                count={data.group_count}
                icon={Users}
                onClick={() => openModal('Qruplar', fakeData.groups)}
              />

              <DashboardCard
                title="Fənnlər"
                count={data.discipline_count}
                icon={BookOpen}
                onClick={() => openModal('Fənnlər', fakeData.subjects)}
              />

              <DashboardCard
                title="İstifadəçilər"
                count={data.user_count}
                icon={UserRound}
                onClick={() => openModal('İstifadəçilər', fakeData.users)}
              />

              <DashboardCard
                title="İxtisaslar"
                count={data.speciality_count}
                icon={GraduationCap}
                onClick={() => openModal('İxtisaslar', fakeData.specialties)}
              />
            </>
          )}
        </div>
      </div>

      <Modal
        title={modalData.title}
        data={modalData.data}
        isOpen={modalData.isOpen}
        onClose={closeModal}
      />
    </div>
  );
}