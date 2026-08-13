import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('aljannat_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {}

    // Default registered test user (Aimal) starting as 'customer'
    return {
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      id: '64f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Aimal Khan',
      email: 'aimal@aljannat.com',
      role: 'customer', // Initial role before bulk inquiry approval
      token: 'jwt_test_token_aimal_123',
    };
  });

  const login = (email = 'aimal@aljannat.com', password = 'password123', role = 'customer') => {
    // Check if role was upgraded via inquiry approval
    let currentRole = role;
    try {
      const savedRole = localStorage.getItem(`user_role_${email.toLowerCase()}`);
      if (savedRole) currentRole = savedRole;
    } catch (e) {}

    const loggedUser = {
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      id: '64f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Aimal Khan',
      email,
      role: currentRole,
      token: 'jwt_test_token_aimal_123',
    };
    setUser(loggedUser);
    try {
      localStorage.setItem('aljannat_user', JSON.stringify(loggedUser));
    } catch (e) {}
    return loggedUser;
  };

  const updateRole = (newRole) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, role: newRole };
      try {
        localStorage.setItem('aljannat_user', JSON.stringify(updated));
        localStorage.setItem(`user_role_${prev.email.toLowerCase()}`, newRole);
      } catch (e) {}
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('aljannat_user');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
