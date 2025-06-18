import { useParams } from "react-router-dom";
import { get } from "../../api/service";
import { useEffect, useState } from "react";

const UserViewPage = () => {
  const [user, setUser] = useState<any>({});
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await get(`/api/users/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [id]);


  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">İstifadəçi Məlumatları</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Şəxsi Məlumatlar</h2>
          <p><strong>Ad:</strong> {user.name}</p>
          <p><strong>Soyad:</strong> {user.surname}</p>
          <p><strong>Ata adı:</strong> {user.patronymic}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">İş Məlumatları</h2>
          <p><strong>Vəzifə:</strong> {user.duty}</p>
          <p><strong>İşçi növü:</strong> {user.employee_type}</p>
          <p><strong>Fakültə:</strong> {user.faculty?.name}</p>
          <p><strong>Kafedralar:</strong> {user.department_names ? Object.keys(user.department_names).join(", ") : ''}</p>
          <p><strong>Rollar:</strong> {user.roles ? Object.keys(user.roles).join(", ") : ''}</p>
        </div>
      </div>
    </div>
  );
};

export default UserViewPage;