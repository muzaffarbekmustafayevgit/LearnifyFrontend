 
 function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">🛠 Admin Panel</h1>
      <ul className="mt-4 space-y-2">
        
        <li><a href="/admin/users">👥 Userlarni boshqarish</a></li>
        <li><a href="/admin/roles">🔑 Rollar</a></li>
        <li><a href="/admin/courses">📚 Kurslarni boshqarish</a></li>
      </ul>
    </div>
  );
}
export default AdminDashboard