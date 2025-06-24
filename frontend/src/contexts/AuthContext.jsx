import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      setAuthData(JSON.parse(storedAuth));
    }
    setIsAuthLoaded(true);
  }, []);

  useEffect(() => {
    if (authData) {
      localStorage.setItem('auth', JSON.stringify(authData));
    } else {
      localStorage.removeItem('auth');
    }
  }, [authData]);

useEffect(() => {
    async function checkTermsAcceptance() {
      if (!authData?.token) return;

      try {
        const res = await fetch('http://localhost:3000/terms/active');
        const data = await res.json();
        const activeVersion = data?.term?.version;
        const acceptedVersion = authData?.user?.acceptedTerms?.version;

        if (activeVersion && acceptedVersion !== activeVersion) {
          navigate('/terms'); // redireciona para página de aceitação
        }
      } catch (err) {
        console.error('Erro ao verificar termos:', err);
      }
    }

    checkTermsAcceptance();
  }, [authData]); // roda toda vez que o usuário fizer login

  const value = { authData, setAuthData };

  if (!isAuthLoaded) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
