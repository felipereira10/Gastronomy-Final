import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);       // contém token e user
  const [isAuthLoaded, setIsAuthLoaded] = useState(false); // para evitar renderização antes do carregamento

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      setAuthData(JSON.parse(storedAuth));
    }
    setIsAuthLoaded(true);
  }, []);

  useEffect(() => {
    if (authData?.token) {
      localStorage.setItem('auth', JSON.stringify(authData));
    } else {
      localStorage.removeItem('auth');
    }
  }, [authData]);

  // Permite logout direto do contexto
  const logout = () => {
    setAuthData(null);
    localStorage.removeItem('auth');
  };

  const value = {
    authData,
    setAuthData,
    logout,
    isAuthenticated: !!authData?.token,
  };

  if (!isAuthLoaded) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
