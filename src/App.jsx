import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getUserRole } from "./utils/auth";

import Profile from "./pages/shared/Profile";
import ChangePassword from "./pages/shared/ChangePassword";
import ResetPassword from "./pages/shared/ResetPassword";
import Register from "./pages/shared/Register";
import ActivateAccount from "./pages/shared/ActivateAccount";
import Login from "./pages/shared/Login";
import Logout from "./pages/shared/Logout"; // Agar logout page bo‘lsa

// Admin pages
import UserList from "./pages/admin/UserList";
import UserDetails from "./pages/admin/UserDetails";
import CourseStats from "./pages/admin/CourseStats";
import AchievementManager from "./pages/admin/AchievementManager";
import SystemHealth from "./pages/admin/SystemHealth";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Statistics from "./pages/admin/Statistics";
import ManageCourses from "./pages/admin/ManageCourses";

// Teacher pages
import CourseList from "./pages/teacher/CourseList";
import EditCourse from "./pages/teacher/EditCourse";
import ModuleManager from "./pages/teacher/ModuleManager";
import LessonManager from "./pages/teacher/LessonManager";
import StudentProgress from "./pages/teacher/StudentProgress";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateCourse from "./pages/teacher/CreateCourse";

// Student pages
import MyCourses from "./pages/student/MyCourses";
import CourseDetail from "./pages/student/CourseDetail";
import LessonViewer from "./pages/student/LessonViewer";
import TestPage from "./pages/student/TestPage";
import Achievements from "./pages/student/Achievements";
import Certificates from "./pages/student/Certificates";

// Shared
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

export default function App() {
  const role = getUserRole(); // "admin" | "teacher" | "student"

  return (
    <Router>
      {/* Navbar har doim ko‘rinadi */}
      <Navbar />

      <Routes>
        {/* Shared routes */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Admin routes */}
        {role === "admin" && (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/users/:id" element={<UserDetails />} />
            <Route path="/admin/course-stats/:id" element={<CourseStats />} />
            <Route path="/admin/achievements" element={<AchievementManager />} />
            <Route path="/admin/manage-users" element={<ManageUsers />} />
            <Route path="/admin/statistics" element={<Statistics />} />
            <Route path="/admin/manage-courses" element={<ManageCourses />} />
            <Route path="/admin/health" element={<SystemHealth />} />
          </>
        )}

        {/* Teacher routes */}
        {role === "teacher" && (
          <>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<CourseList />} />
            <Route path="/teacher/courses/:id" element={<EditCourse />} />
            <Route path="/teacher/modules" element={<ModuleManager />} />
            <Route path="/teacher/lessons" element={<LessonManager />} />
            <Route path="/teacher/progress/:courseId" element={<StudentProgress />} />
            <Route path="/teacher/create-course" element={<CreateCourse />} />
          </>
        )}

        {/* Student routes */}
        {role === "student" && (
          <>
            <Route path="/student/my-courses" element={<MyCourses />} />
            <Route path="/student/course/:courseId" element={<CourseDetail />} />
            <Route path="/student/lesson/:id" element={<LessonViewer />} />
            <Route path="/student/test/:id" element={<TestPage />} />
            <Route path="/student/achievements" element={<Achievements />} />
            <Route path="/student/certificates" element={<Certificates />} />
          </>
        )}

        {/* 404 page */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}
