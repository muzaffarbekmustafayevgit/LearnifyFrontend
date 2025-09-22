import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
// Sahifa componentlari (simple placeholder)
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard"

function App() {
  return (
      <BrowserRouter>
        {/* Navbar */}
        <nav className="flex gap-4 p-4 bg-gray-200">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/student">Student</Link>
          <Link to="/teacher">Teacher</Link>
          <Link to="/admin">Admin</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
  );
}
export default App;