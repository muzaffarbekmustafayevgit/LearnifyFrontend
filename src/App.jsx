import { BrowserRouter, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
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
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
