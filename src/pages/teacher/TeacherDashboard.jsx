export default function TeacherDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">👨‍🏫 Teacher Dashboard</h1>
      <ul className="mt-4 space-y-2">
        <li><a href="/teacher/courses">📚 Kurslarim</a></li>
        <li><a href="/teacher/courses/new">➕ Yangi kurs yaratish</a></li>
        <li><a href="/teacher/students">👥 O‘quvchilar</a></li>
      </ul>
    </div>
  );
}
