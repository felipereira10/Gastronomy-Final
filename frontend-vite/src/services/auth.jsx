import { useState } from "react";

export default function useAuthServices() {
    const [authLoading, setAuthLoading] = useState(false)

    const url = 'http://localhost:3000/auth'

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
          console.log("Resultado do login:", result);
      
          if (result.success && result.body.token) {
            console.log("Token:", result.body.token);
            console.log("User:", result.body.user);
      
            localStorage.setItem(
              'auth',
              JSON.stringify({ token: result.body.token, user: result.body.user })
            );
      
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
        localStorage.removeItem('auth')
    };

    const signup = (formData) => {
        setAuthLoading(true)
        
        fetch(`${url}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(formData)
        })
        .then((response) => response.json())
        .then((result) => {
            console.log(result)
            if(result.success && result.body.token) {
                localStorage.setItem(
                    'auth',
                    JSON.stringify({ token: result.body.token, user: result.body.user })
                );
                navigate('/auth');
            }
        })
        
        .catch((error) => {
            console.log(error)
        })
        .finally(() => {
            setAuthLoading(false)
        })
    };

    return { signup, login, logout, authLoading };
} 