// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

// Public pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import Activate from "../pages/Activate";
import Profile from "../pages/Profile";

// Student
import StudentDashboard from "../pages/student/StudentDashboard";
import Courses from "../pages/student/Courses";
import Progress from "../pages/student/Progress";
import CourseDetail from "../pages/student/CourseDetail";

// Teacher
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
// (Masalan: CreateCourse.jsx va ManageCourses.jsx ni teacher papkaga qo‘shasiz)
// import CreateCourse from '../pages/teacher/CreateCourse'
import ManageCourses from "../pages/teacher/ManageCourses";

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard'
// (Masalan: ManageUsers.jsx va SystemSettings.jsx ni admin papkaga qo‘shasiz)
import ManageUsers from "../pages/admin/ManageUsers";
import SystemSettings from "../pages/admin/SystemSettings";

// Utils
import ProtectedRoute from "./ProtectedRoute";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activate" element={<Activate />} />
      <Route path="/profile" element={<Profile />} />

      {/* Student routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="courses" element={<Courses />} />
        <Route path="progress" element={<Progress />} />
        <Route path="course/:id" element={<CourseDetail />} />
      </Route>

      {/* Teacher routes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="manage-courses" element={<ManageCourses />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<h1 className="mt-20 text-center">404 | Page Not Found</h1>} />
    </Routes>
  );
}
