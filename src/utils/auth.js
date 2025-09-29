// utils/auth.js
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

export const getUserRole = () => localStorage.getItem("role"); 
// login qilganda backenddan role olib saqlash kerak
