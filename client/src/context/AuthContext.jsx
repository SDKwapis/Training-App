import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hit_token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hit_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function login(newToken, newUser) {
    localStorage.setItem('hit_token', newToken);
    localStorage.setItem('hit_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('hit_token');
    localStorage.removeItem('hit_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
