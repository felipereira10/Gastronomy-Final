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
          
          if (!response.ok) {
            throw new Error(`Erro ao fazer login: ${response.statusText}`);
          }
      
          const result = await response.json();
          console.log("Resultado do login:", result);
      
          if (result.success && result.body.token) {
            const authPayload = {
              token: result.body.token,
              user: result.body.user
            };
          
            localStorage.setItem('auth', JSON.stringify(authPayload));
            setAuthData(authPayload); // atualiza o contexto
            
            return result;
          }          
      
          return null;
        } catch (error) {
          console.error("Erro no login:", error);
          return null;
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
                  'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify(formData),
          });
  
          const result = await response.json();
          console.log(result);
  
          if (result.success && result.body.token) {
            const authPayload = {
              token: result.body.token,
              user: result.body.user
            };
          
            localStorage.setItem('auth', JSON.stringify(authPayload));
            setAuthData(authPayload); // atualiza o contexto
            navigate('/profile');
          }
      } catch (error) {
          console.log(error);
      } finally {
          setAuthLoading(false);
      }
  };
  

    return { signup, login, logout, authLoading };
}
