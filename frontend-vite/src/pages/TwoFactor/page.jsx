// src/pages/Auth/TwoFactor.jsx

import { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TwoFactor() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success && result.body.token) {
        const authPayload = {
          token: result.body.token,
          user: result.body.user,
        };

        localStorage.setItem('auth', JSON.stringify(authPayload));
        setAuthData(authPayload);
        navigate('/profile');
      } else {
        setError('Código inválido. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao verificar código 2FA:', err);
      setError('Erro de conexão. Tente novamente.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: 60 }}>
      <Typography variant="h5" gutterBottom>
        Verificação em duas etapas
      </Typography>
      <Typography variant="body1" gutterBottom>
        Digite o código de 6 dígitos enviado ao seu email.
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Código"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          margin="normal"
          required
        />
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        <Button type="submit" variant="contained" fullWidth>
          Confirmar
        </Button>
      </form>
    </div>
  );
}
