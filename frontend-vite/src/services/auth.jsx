import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function useAuthServices() {
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const url = 'http://localhost:3000/auth';

  // 🧩 Etapa 1 - Envia email/senha, mas não autentica ainda
  const login = async (formData) => {
    setAuthLoading(true);
    try {
      const response = await fetch(`${url}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao fazer login: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Resultado do login:", result);

      if (result.success && result.body.pending2FA) {
        // backend envia um sinal de que o código foi enviado
        return { requiresVerification: true, email: formData.email };
      }

      return null;
    } catch (error) {
      console.error("Erro no login:", error);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  // 🧩 Etapa 2 - Envia o código e recebe o token
  const verifyCode = async ({ email, code }) => {
    setAuthLoading(true);
    try {
      const response = await fetch(`${url}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        throw new Error("Falha na verificação do código");
      }

      const result = await response.json();
      console.log("Resultado da verificação:", result);

      if (result.success && result.body.token) {
        const authPayload = {
          token: result.body.token,
          user: result.body.user,
        };

        localStorage.setItem('auth', JSON.stringify(authPayload));
        setAuthData(authPayload);
        navigate('/profile');
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro na verificação de código:", error);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (formData) => {
    setAuthLoading(true);
    try {
      const response = await fetch(`${url}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log(result);

      if (result.success && result.body.token) {
        const authPayload = {
          token: result.body.token,
          user: result.body.user,
        };

        localStorage.setItem('auth', JSON.stringify(authPayload));
        setAuthData(authPayload);
        navigate('/profile');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setAuthData(null);
  };

  return {
    signup,
    login,
    verifyCode, // 👈 adicionado
    logout,
    authLoading
  };
}

