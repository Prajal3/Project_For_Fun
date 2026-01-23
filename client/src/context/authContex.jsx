import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export const AuthContex = createContext();

export const AuthContexProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem("user");
    return user && user !== "undefined" ? JSON.parse(user) : null;
  });

  const login = async (inputs) => {
    try {
      const res = await api.post("/auth/login", inputs);
      
      const userData = res.data.user || res.data;
      const token = res.data.token;
      
      setCurrentUser(userData);
      
      if (token) {
        localStorage.setItem("token", token);
      }
      localStorage.setItem("user", JSON.stringify(userData));
      
      return res.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/"; // Force reload to clear state
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  return (
    <AuthContex.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContex.Provider>
  );
};