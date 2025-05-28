import { useState, useEffect } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment
} from "@mui/material";
import styles from './page.module.css';
import { useNavigate } from "react-router-dom";
import useAuthServices from "../../services/auth";
import { useAuth } from '../../context/AuthContext';

export default function Auth() {
  const [formType, setFormType] = useState('login');
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, signup, authLoading } = useAuthServices();
  const navigate = useNavigate();
  const { authData } = useAuth();

  useEffect(() => {
    if (authData?.token) {
      navigate('/profile');
    }
  }, [authData?.token]);

  const handleChangeFormType = () => {
    setFormType((prev) => (prev === 'login' ? 'signup' : 'login'));
    setFormData({});
  };

  const handleFormDataChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (formType === 'login') {
      const result = await login(formData);

      if (result?.requiresVerification) {
        navigate('/2fa', { state: { email: formData.email } });
        return;
      }

      if (result?.success && result.body?.token) {
        navigate('/profile');
      } else {
        alert("Falha no login");
      }
    }

    if (formType === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      await signup(formData);
    }
  };

  if (authLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className={styles.authPageContainer}>
      {formType === 'login' && (
        <>
          <h1>Login</h1>
          <button onClick={handleChangeFormType}>
            Don't have an account? Click here
          </button>
          <form onSubmit={handleSubmitForm}>
            <TextField
              required
              label="Email"
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleFormDataChange}
              fullWidth
              margin="normal"
            />
            <TextField 
              required
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleFormDataChange}
              value={formData.password || ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
              margin="normal"
            />
            <Button type="submit" variant="contained" fullWidth>
              Login
            </Button>
          </form>
        </>
      )}

      {formType === 'signup' && (
        <>
          <h1>Signup</h1>
          <button onClick={handleChangeFormType}>
            Already have an account? Click here
          </button>
          <form onSubmit={handleSubmitForm}>
            <TextField
              required
              label="Fullname"
              name="fullname"
              value={formData.fullname || ""}
              onChange={handleFormDataChange}
              fullWidth
              margin="normal"
            />
            <TextField
              required
              label="Email"
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleFormDataChange}
              fullWidth
              margin="normal"
            />
            <TextField
              required
              label="Password"
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleFormDataChange}
              fullWidth
              margin="normal"
            />
            <TextField
              required
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword || ""}
              onChange={handleFormDataChange}
              fullWidth
              margin="normal"
            />
            <Button type="submit" variant="contained" fullWidth>
              Signup
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
    