import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/users';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError('Token topilmadi. Iltimos, tizimga kiring.');
        setLoading(false);
        return;
      }

      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError('Kirish rad etildi. Token yaroqsiz yoki muddati tugagan.');
        } else if (res.status === 403) {
          setError('Sizda admin huquqi yoʻq.');
        } else {
          throw new Error(`Server xatosi: ${res.status}`);
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Xatolik:', err);
      setError('Foydalanuvchilarni yuklashda xatolik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Haqiqatan ham o‘chirmoqchimisiz?')) return;
    
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Oʻchirishda xatolik');
      }

      const data = await res.json();
      alert(data.message);
      fetchUsers(); // ro'yxatni yangilash
    } catch (err) {
      console.error('Oʻchirish xatosi:', err);
      alert('Xatolik: ' + err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Yuklanmoqda...</p>;

  if (error) {
    return (
      <div>
        <h2>Foydalanuvchilar roʻyxati</h2>
        <div style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Foydalanuvchilar roʻyxati</h2>
      
      {users.length === 0 ? (
        <p>Foydalanuvchilar topilmadi</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th>Ism</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? 'Faol' : 'Nofaol'}</td>
                <td>
                  <button 
                    onClick={() => deleteUser(u._id)}
                    style={{
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    O‘chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;