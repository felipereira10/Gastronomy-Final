import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirm) {
      setMessage('As senhas não coincidem');
      setIsSuccess(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Senha redefinida com sucesso!');
        setIsSuccess(true);
      } else {
        setMessage(data.message || 'Erro ao redefinir senha');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Erro de conexão com o servidor');
      setIsSuccess(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Redefinir Senha</h2>
      <input
        type="password"
        placeholder="Nova senha"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirmar nova senha"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
      />
      <button onClick={handleSubmit}>Salvar nova senha</button>

      {message && (
        <div className={isSuccess ? styles.successModal : styles.errorModal}>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
