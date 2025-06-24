import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

export default function useAuthServices() {
    const [authLoading, setAuthLoading] = useState(false);
    const navigate = useNavigate();
    const { setAuthData } = useAuth();

    const url = 'http://localhost:3000/auth';

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

        const result = await response.json();

        if (!response.ok) {
          // Lança erro com a mensagem do backend, se houver
          const errorMessage = result?.body?.text || 'Login failed';
          throw new Error(errorMessage);
        }

        if (result.success && result.body.token) {
          const authPayload = {
            token: result.body.token,
            user: result.body.user,
            // mustAcceptTerms: result.body.mustAcceptTerms || false,
            // currentTerms: result.body.currentTerms || null,
          };

          localStorage.setItem('auth', JSON.stringify(authPayload));
          setAuthData(authPayload);
          return result;
        }

        // Caso o login não tenha sucesso, lança erro também
        throw new Error(result?.body?.text || 'Invalid login attempt');
      } catch (error) {
        console.error("Erro no login:", error);
        throw error; // repassa erro para o componente usar
      } finally {
        setAuthLoading(false);
      }
    };


    const logout = () => {
      setAuthData(null);
      localStorage.removeItem("auth");
    };

    const signup = async (formData) => {
    setAuthLoading(true);

    try {
        const response = await fetch(`${url}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success && result.body.token) {
            const authPayload = {
              token: result.body.token,
              user: result.body.user,
              // mustAcceptTerms: result.body.mustAcceptTerms,
              // currentTerms: result.body.currentTerms
            };

            localStorage.setItem('auth', JSON.stringify(authPayload));
            setAuthData(authPayload);

            // Redireciona após o cadastro
            navigate('/profile');
        } else {
            console.error("Erro no signup:", result.body?.text || result);
        }

        return result;
    } catch (error) {
        console.error("Erro no signup:", error);
        return null;
    } finally {
        setAuthLoading(false);
    }
};

  

    return { signup, login, logout, authLoading };
}
