import { useState, useEffect } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography
} from "@mui/material";
import styles from './page.module.css';
import { useNavigate } from "react-router-dom";
import useAuthServices from "../../services/auth";
import { useAuth } from '../../contexts/AuthContext';

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
  }

  const handleFormDataChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (formType === 'login') {
      login(formData, navigate);
    } else if (formType === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      signup(formData, navigate);
    }
  }

  if (authLoading) {
    return <Typography variant="h4">Loading...</Typography>;
  }

  return (
    <div className={styles.authBackground}>
      <div className={styles.authCard}>
        {formType === 'login' ? (
          <>
            <h2>Login</h2>
            <button className={styles.switchFormBtn} onClick={handleChangeFormType}>
              Don't have an account? Click here
            </button>
            <form className={styles.authForm} onSubmit={handleSubmitForm}>
              <TextField
                required
                label="Email"
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleFormDataChange}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  style: { 
                    color: "#faf0ca",
                    top: "-10px" // sobe ou desce o label quando está flutuando
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px", // aumenta espaço interno no topo
                  }
                }}
              />
              <TextField
                required
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password || ""}
                onChange={handleFormDataChange}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  style: { 
                    color: "#faf0ca",
                    top: "-10px" // sobe ou desce o label quando está flutuando
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px", // aumenta espaço interno no topo
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? (
                          <VisibilityOff style={{ color: "#faf0ca" }} />
                        ) : (
                          <Visibility style={{ color: "#faf0ca" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button type="submit" variant="contained" color="primary"
                style={{ 
                  width: '150px',
                  alignSelf: 'center'
                }}
              >
                Login
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2>Signup</h2>
            <button className={styles.switchFormBtn} onClick={handleChangeFormType}>
              Already have an account? Click here
            </button>
            <form className={styles.authForm} onSubmit={handleSubmitForm}>
              <TextField
                required
                label="Fullname"
                name="fullname"
                value={formData.fullname || ""}
                onChange={handleFormDataChange}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  style: { 
                    color: "#faf0ca",
                    top: "-10px" // sobe ou desce o label quando está flutuando
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px", // aumenta espaço interno no topo
                  }
                }}
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
                variant="outlined"
                InputLabelProps={{
                  style: { 
                    color: "#faf0ca",
                    top: "-10px" // sobe ou desce o label quando está flutuando
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px", // aumenta espaço interno no topo
                  }
                }}
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
                variant="outlined"
                InputLabelProps={{
                  style: { 
                    color: "#faf0ca",
                    top: "-10px" // sobe ou desce o label quando está flutuando
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px", // aumenta espaço interno no topo
                  }
                }}
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
                variant="outlined"
                InputLabelProps={{
                  style: { 
                    color: "#faf0ca",
                    top: "-10px" // sobe ou desce o label quando está flutuando
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px", // aumenta espaço interno no topo
                  }
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="secondary"
                style={{
                  width: '150px',
                  alignSelf: 'center'
                }}
              >
                Signup
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
