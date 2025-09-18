import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">🎓 Student Dashboard</h1>
      <ul className="mt-4 space-y-2">
        <li><Link to="courses">📚 Kurslar</Link></li>
        <li><Link to="progress">📊 Mening progressim</Link></li>
      </ul>
    </div>
  );
}
