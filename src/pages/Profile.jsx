import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, handleLogout } = useAuth();

  if (!user) return <p className="mt-20 text-center">You are not logged in</p>;

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-2">👤 {user.name}</p>
      <p>📧 {user.email}</p>
      <button
        onClick={handleLogout}
        className="p-2 mt-4 text-white bg-red-500 rounded"
      >
        Logout
      </button>
    </div>
  );
}
