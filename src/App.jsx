import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getUserRole } from "./utils/auth";

// 🔹 Shared pages
import Profile from "./pages/shared/Profile";
import ChangePassword from "./pages/shared/ChangePassword";
import ResetPassword from "./pages/shared/ResetPassword";
import Register from "./pages/shared/Register";
import ActivateAccount from "./pages/shared/ActivateAccount";
import Login from "./pages/shared/Login";
import Logout from "./pages/shared/Logout";
import NotFound from "./pages/NotFound";

// 🔹 Admin pages
import UserList from "./pages/admin/UserList";
import UserDetails from "./pages/admin/UserDetails";
import CourseStats from "./pages/admin/CourseStats";
import AchievementManager from "./pages/admin/AchievementManager";
import SystemHealth from "./pages/admin/SystemHealth";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Statistics from "./pages/admin/Statistics";
import ManageCourses from "./pages/admin/ManageCourses";

// 🔹 Teacher pages
import CourseList from "./pages/teacher/CourseList";
import EditCourse from "./pages/teacher/EditCourse";
import ModuleManager from "./pages/teacher/ModuleManager";
import LessonManager from "./pages/teacher/LessonManager";
import StudentProgress from "./pages/teacher/StudentProgress";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateCourse from "./pages/teacher/CreateCourse";

// 🔹 Student pages
import MyCourses from "./pages/student/MyCourses";
import CourseDetail from "./pages/student/CourseDetail";
import TestPage from "./pages/student/TestPage";
import Achievements from "./pages/student/Achievements";
import Certificates from "./pages/student/Certificates";
import CourseView from "./pages/student/CourseView";
import StudentDashboard from "./pages/student/StudentDashboard";

// ======================================================
// 🔐 ProtectedRoute component
// ======================================================
function ProtectedRoute({ children, allowedRoles }) {
  const role = getUserRole();

  // Agar foydalanuvchi tizimga kirmagan bo‘lsa
  if (!role) return <Navigate to="/" replace />;

  // Agar role ruxsat etilgan ro‘yxatda bo‘lmasa
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return children;
}

// ======================================================
// 🧠 Main App Component
// ======================================================
export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Shared routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />

        {/* ======================================================
            👑 ADMIN ROUTES
        ====================================================== */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/course-stats/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CourseStats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/achievements"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AchievementManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/statistics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Statistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-courses"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/health"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SystemHealth />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
            🎓 TEACHER ROUTES
        ====================================================== */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <CourseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/modules"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <ModuleManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/lessons"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <LessonManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/progress/:courseId"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <StudentProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/create-course"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <CreateCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <EditCourse />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
            👨‍🎓 STUDENT ROUTES
        ====================================================== */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-courses"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/test/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <TestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/achievements"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Achievements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/certificates"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Certificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/course/:courseId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/course/:courseId/view"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <CourseView />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
            🚫 NOT FOUND
        ====================================================== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
