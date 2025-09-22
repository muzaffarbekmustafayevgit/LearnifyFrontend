import React, { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // localStorage dan userni olish
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (!user) {
    return <div>Hech qanday ma’lumot topilmadi. Iltimos, login qiling.</div>;
  }

  return (
    <div className="max-w-md p-4 mx-auto space-y-4 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-bold text-gray-800">Profil Ma’lumotlari</h2>
      <p><strong>Ism:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Rol:</strong> {user.role}</p>
    </div>
  );
}

export default Profile;
