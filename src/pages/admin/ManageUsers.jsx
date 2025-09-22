import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/users';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    isActive: true
  });

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
      fetchUsers();
    } catch (err) {
      console.error('Oʻchirish xatosi:', err);
      alert('Xatolik: ' + err.message);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'student',
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const updateUser = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/${editingUser._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Yangilashda xatolik');
      }

      const data = await res.json();
      alert(data.message);
      closeEditModal();
      fetchUsers();
    } catch (err) {
      console.error('Yangilash xatosi:', err);
      alert('Xatolik: ' + err.message);
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = !user.isActive;
    const confirmMessage = newStatus 
      ? `Haqiqatan ham ${user.name} foydalanuvchisini faollashtirmoqchimisiz?`
      : `Haqiqatan ham ${user.name} foydalanuvchisini bloklamoqchimisiz?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/${user._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...user,
          isActive: newStatus
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Statusni o‘zgartirishda xatolik');
      }

      const data = await res.json();
      alert(data.message);
      fetchUsers();
    } catch (err) {
      console.error('Statusni o‘zgartirish xatosi:', err);
      alert('Xatolik: ' + err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Yuklanmoqda...</p>
    </div>
  );

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Foydalanuvchilar roʻyxati</h2>
        <div style={{ 
          color: 'red', 
          padding: '15px', 
          border: '1px solid red', 
          borderRadius: '5px',
          backgroundColor: '#ffe6e6',
          marginBottom: '20px'
        }}>
          {error}
        </div>
        <button 
          onClick={fetchUsers}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Foydalanuvchilar boshqaruvi</h2>
        <span style={{ color: '#666' }}>Jami: {users.length} ta foydalanuvchi</span>
      </div>
      
      {users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>Foydalanuvchilar topilmadi</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Ism</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        user.role === 'admin' ? '#dc3545' : 
                        user.role === 'teacher' ? '#28a745' : '#007bff',
                      color: 'white'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span 
                      onClick={() => toggleUserStatus(user)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: user.isActive ? '#28a745' : '#6c757d',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                    >
                      {user.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => openEditModal(user)}
                      style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginRight: '5px',
                        fontSize: '12px'
                      }}
                    >
                      Tahrirlash
                    </button>
                    <button 
                      onClick={() => deleteUser(user._id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Foydalanuvchini tahrirlash</h3>
            <form onSubmit={updateUser}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ism:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Role:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span style={{ fontWeight: 'bold' }}>Faol foydalanuvchi</span>
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer'
                  }}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;