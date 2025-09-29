import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function StudentProgress() {
  const { courseId } = useParams();
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setProgress(data.data.students || []));
  }, [courseId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">📊 Talabalar progressi</h1>
      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Talaba</th>
            <th className="p-2">Foiz</th>
            <th className="p-2">Holat</th>
          </tr>
        </thead>
        <tbody>
          {progress.map((p) => (
            <tr key={p.studentId} className="border-t">
              <td className="p-2">{p.studentName}</td>
              <td className="p-2">{p.completion}%</td>
              <td className="p-2">
                {p.completion === 100 ? "✅ Tugallandi" : "⏳ Davom etmoqda"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
