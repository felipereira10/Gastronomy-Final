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
import Loading from "../../components/Loading/Loading.jsx";
import { FormControlLabel, Checkbox } from '@mui/material';
import { Link } from "react-router-dom";


export default function Auth() {
  const [formType, setFormType] = useState('login');
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, authLoading } = useAuthServices();
  const navigate = useNavigate();
  const { authData } = useAuth();
  const [activeTerms, setActiveTerms] = useState(null);



  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoadingAfterLogin, setIsLoadingAfterLogin] = useState(false);
  const [delayedRedirect, setDelayedRedirect] = useState(false);


  useEffect(() => {
    if (authData?.token && delayedRedirect) {
      if (authData.mustAcceptTerms) {
        navigate('/terms');
      } else {
        navigate('/profile');
      }
    }
  }, [authData?.token, delayedRedirect]);


  useEffect(() => {
    const fetchActiveTerms = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/terms/active");
        const data = await res.json();
        if (data.success) {
          setActiveTerms(data.term); // salva o termo ativo
        }
      } catch (err) {
        console.error("Erro ao buscar termos ativos:", err);
      }
    };

    if (formType === "signup") {
      fetchActiveTerms();
    }
  }, [formType]);


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

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (formType === 'login') {
        const res = await login(formData);

      if (res?.mustAcceptTerms) {
        navigate('/terms');
      } else {
        setIsLoadingAfterLogin(true);
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }


      } else if (formType === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage('Passwords do not match');
          return;
        }

        if (!formData.acceptTerms) {
          setErrorMessage('You must accept the Terms of Service to sign up');
          return;
        }

        if (!activeTerms) {
          setErrorMessage('Erro ao obter a versão dos termos. Tente novamente mais tarde.');
          return;
        }

        await signup({
          ...formData,
          acceptedTerms: {
            version: activeTerms.version,
            acceptedAt: new Date()
          }
        });

        setIsLoadingAfterLogin(true);
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };



  if (authLoading || isLoadingAfterLogin) {
    return <Loading />;
  }

  return (
    <div className={styles.authBackground}>
      <div className={styles.authCard}>

        {/* Mensagens de erro e sucesso, sempre visíveis se existirem */}
        {errorMessage && (
        <Typography className={styles.errorMessage} role="alert" gutterBottom>
          {errorMessage}
        </Typography>
        )}
        {successMessage && (
          <Typography className={styles.successMessage} role="alert" gutterBottom>
            {successMessage}
          </Typography>
        )}
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
                    top: "-10px"
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px",
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
                    top: "-10px"
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px",
                  }
                }}
              />
              
              <TextField
                required
                label="Birthdate"
                type="date"
                name="birthdate"
                value={formData.birthdate || ""}
                onChange={handleFormDataChange}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                  style: { 
                    color: "#faf0ca"
                  }
                }}
                InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px",
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
                    top: "-10px"
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px",
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
                    top: "-10px"
                  }
                }}
                 InputProps={{
                  style: {
                    color: "#faf0ca",
                    backgroundColor: "#003c3c",
                    borderRadius: "6px",
                    paddingTop: "3px",
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptTerms || false}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <span>
                    I accept the <Link to="/terms">Terms of Service</Link>
                  </span>
                }
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
