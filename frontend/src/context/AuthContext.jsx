/**
 * AuthContext — JWT authentication state management
 */
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("edusign_token");
    const savedUser = localStorage.getItem("edusign_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse saved user:", err);
        localStorage.removeItem("edusign_token");
        localStorage.removeItem("edusign_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login(username, password);
    const { access_token, user: userData } = res.data;

    localStorage.setItem("edusign_token", access_token);
    localStorage.setItem("edusign_user", JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);

    return userData;
  };

  const register = async (username, password) => {
    const res = await authAPI.register(username, password);
    const { access_token, user: userData } = res.data;

    localStorage.setItem("edusign_token", access_token);
    localStorage.setItem("edusign_user", JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem("edusign_token");
    localStorage.removeItem("edusign_user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
