import { useState, useEffect } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  Modal,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import styles from './page.module.css';
import { useNavigate } from "react-router-dom";
import useAuthServices from "../../services/auth";
import { useAuth } from '../../contexts/AuthContext';
import Loading from "../../components/Loading/Loading.jsx";
import { Link } from "react-router-dom";

export default function Auth() {
  const [formType, setFormType] = useState('login');
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, authLoading } = useAuthServices();
  const navigate = useNavigate();
  const { authData } = useAuth();
  const [activeTerms, setActiveTerms] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedOptionalSections, setAcceptedOptionalSections] = useState({});



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
  }, [authData?.token, delayedRedirect, navigate]);



  useEffect(() => {
    const fetchActiveTerms = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/terms/active");
        const data = await res.json();
        if (data.success) {
          setActiveTerms(data.term);
          // Inicializa o estado acceptedOptionalSections com todos opcionais como true
          const initialAccepted = {};
          data.term.sections.forEach(section => {
            if (!section.required) {
              initialAccepted[section.title] = true;
            }
          });
          setAcceptedOptionalSections(initialAccepted);
        }
      } catch (err) {
        console.error("Erro ao buscar termos ativos:", err);
      }
    };

    if (formType === 'signup') {
      fetchActiveTerms();
    } else {
      // Limpa termos e aceitação quando muda para login
      setActiveTerms(null);
      setAcceptedOptionalSections({});
    }
  }, [formType]);

  // Inicializa acceptedOptionalSections quando ativoTerms carregar
  // useEffect(() => {
  //   if (showTermsModal && activeTerms) {
  //     const initialAccepted = {};
  //     activeTerms.sections.forEach((section) => {
  //       // Começa marcado
  //       initialAccepted[section.title] = true;
  //     });
  //     setAcceptedOptionalSections(initialAccepted);
  //   }
  // }, [showTermsModal, activeTerms]);

  const toggleSectionAcceptance = (title) => {
    setAcceptedOptionalSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleChangeFormType = () => {
    setFormType(prev => (prev === 'login' ? 'signup' : 'login'));
    setFormData({});
    setErrorMessage('');
    setSuccessMessage('');
    setDelayedRedirect(false);
  };

  const handleFormDataChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (formType === 'login') {
        const res = await login(formData);

        if (res?.mustAcceptTerms) {
          navigate('/terms');
        } else {
          setDelayedRedirect(true);
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
          setErrorMessage('Erro ao obter os termos. Tente novamente mais tarde.');
          return;
        }

        // const acceptedTerms = {
        //   version: activeTerms.version,
        //   acceptedAt: new Date(),
        //   sections: activeTerms.sections.map(section => ({
        //     title: section.title,
        //     acceptedAt: new Date(),
        //     accepted:
        //       section.required || // sempre aceito se obrigatório
        //       (formData.acceptTerms && acceptedOptionalSections[section.title]), // se opcional, só aceita se marcado no modal e checkbox geral marcado
        //   })),
        // };

        const acceptedTerms = {
          version: activeTerms.version,
          acceptedAt: new Date(),
          sections: activeTerms.sections.map(section => ({
            title: section.title,
            acceptedAt: new Date(),
            accepted: section.required || (acceptedOptionalSections[section.title] ?? true),
          })),
        };
        const optionalAccepted = {};
        activeTerms.sections.forEach(section => {
          if (!section.required) {
            optionalAccepted[section.title] = acceptedOptionalSections[section.title] ?? true;
          }
        });

        await signup({
          ...formData,
          optionalAccepted,
        });

        setIsLoadingAfterLogin(true);
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Erro desconhecido');
    }
  };

  if (authLoading || (delayedRedirect && !authData?.token)) {
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


         {/* Modal de termos */}
  <Modal
    open={showTermsModal}
    onClose={() => setShowTermsModal(false)}
    aria-labelledby="terms-modal-title"
    aria-describedby="terms-modal-description"
  >
    <Box sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      bgcolor: '#fff', // fundo branco para melhor leitura
      color: '#000',
      boxShadow: 24,
      p: 4,
      width: { xs: '90%', sm: '70%', md: '50%' },
      maxHeight: '80vh',
      overflowY: 'auto',
      borderRadius: 2,
    }}>
      <Typography id="terms-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
        Termos e Serviços (v{activeTerms?.version || ''})
      </Typography>
      {activeTerms?.sections?.map((section, i) => (
        <Box key={i} sx={{ mb: 3 }}>
          {section.required ? (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{section.title} (Obrigatório)</Typography>
              <Typography sx={{ whiteSpace: 'pre-line' }}>{section.content}</Typography>
            </>
          ) : (
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedOptionalSections[section.title] || false}
                  onChange={() => toggleSectionAcceptance(section.title)}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'inline' }}>
                    {section.title} (Opcional)
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                    {section.content}
                  </Typography>
                </Box>
              }
            />
          )}
        </Box>
      ))}
      <Button variant="contained" onClick={() => setShowTermsModal(false)} sx={{ mt: 2 }}>
        Fechar
      </Button>
    </Box>
  </Modal>


        {formType === 'login' ? (
          <>
            <h2>Login</h2>
            <button className={styles.switchFormBtn} onClick={handleChangeFormType}>
              Não tem uma conta? Clique aqui
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
                label="Senha"
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
            <h2>Cadastro</h2>
            <button className={styles.switchFormBtn} onClick={handleChangeFormType}>
               Já tem uma conta? Clique aqui
            </button>
            <form className={styles.authForm} onSubmit={handleSubmitForm}>
              <TextField
                required
                label="Nome Completo"
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
                label="Nascimento"
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
                label="Senha"
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
                label="Confirme a Senha"
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
      Eu aceito os{" "}
      <span
        onClick={() => setShowTermsModal(true)}
        style={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "#1976d2",
          fontWeight: "bold",
        }}
      >
        Termos e Serviços
      </span>
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
                Cadastrar
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
