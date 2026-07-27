import { createContext, useContext, useEffect, useState } from "react";
import { api, saveToken, clearToken, getToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  useEffect(() => {
    async function loadCurrentUser() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.me();
        setUser(data.user);
      } catch {
        // token is invalid/expired
        clearToken();
      } finally {
        setLoading(false);
      }
    }
    loadCurrentUser();
  }, []);

  async function login(email, password) {
    const data = await api.login(email, password);
    saveToken(data.access_token);
    setUser(data.user);
  }

  async function register(name, email, password) {
    const data = await api.register(name, email, password);
    saveToken(data.access_token);
    setUser(data.user);
  }

  async function updateProfile(name) {
    const data = await api.updateProfile(name);
    setUser(data.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = { user, loading, isAuthenticated: !!user, login, register, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
