import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setStudent(res.data.student);
      } else {
        setUser(null);
        setStudent(null);
      }
    } catch (err) {
      setUser(null);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setStudent(res.data.student);
      return res.data.user;
    }
    throw new Error('Login failed.');
  }

  async function register(full_name, email, password) {
    const res = await api.post('/auth/register', { full_name, email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setStudent(res.data.student);
      return res.data.user;
    }
    throw new Error('Registration failed.');
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setStudent(null);
    }
  }

  async function refreshUser() {
    await checkAuth();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
