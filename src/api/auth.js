const API_URL = "http://localhost:5000/api/auth";

export async function register(userData) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
}
  export async function handleSubmit  (e)  {
    e.preventDefault();
    setMessage("⏳ Yuborilmoqda...");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ ${data.message || "Xato yuz berdi"}`);
      }
    } catch (err) {
      setMessage("❌ Server bilan ulanishda xatolik!");
    }
  };
export async function login(credentials) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_URL}/logout`, { method: "POST" });
  return res.json();
}

export async function getProfile(token) {
  const res = await fetch(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
