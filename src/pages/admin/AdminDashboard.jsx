import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">👑 Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* User Management */}
        <Link to="/admin/manage-users" className="p-4 bg-blue-100 shadow rounded-xl hover:bg-blue-200">
          👥 Manage Users
        </Link>

        {/* Courses Management */}
        <Link to="/admin/manage-courses" className="p-4 bg-green-100 shadow rounded-xl hover:bg-green-200">
          📚 Manage Courses
        </Link>

        {/* Statistics */}
        <Link to="/admin/statistics" className="p-4 bg-yellow-100 shadow rounded-xl hover:bg-yellow-200">
          📊 Statistics
        </Link>
      </div>
    </div>
  );
}
