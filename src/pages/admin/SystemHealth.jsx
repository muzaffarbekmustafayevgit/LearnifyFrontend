import { useEffect, useState } from "react";

export default function SystemHealth() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    fetch("http://localhost:5000/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("❌ Server ishlamayapti"));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">❤️ Tizim holati</h1>
      <p className="mt-3">Status: {status}</p>
    </div>
  );
}
