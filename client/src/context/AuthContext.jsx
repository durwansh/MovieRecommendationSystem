import React, { createContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    const data = await loginApi(email, password);
    setUser(data.user);
    return data;
  };

  const registerUser = async (name, email, password, preferredGenres) => {
    const data = await registerApi(name, email, password, preferredGenres);
    setUser(data.user);
    return data;
  };

  const logoutUser = () => {
    logoutApi();
    setUser(null);
  };

  const updateUserPreferences = (genres) => {
    if (user) {
      const updated = { ...user, preferredGenres: genres };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loginUser,
        registerUser,
        logoutUser,
        updateUserPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
