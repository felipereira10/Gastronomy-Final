// ... imports
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Checkbox, FormControlLabel, Stack } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext.jsx";
import useAuthServices from "../../services/auth.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import styles from "./page.module.css";
import { FiLogOut, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { FiClipboard } from 'react-icons/fi';
import SecurityIcon from '@mui/icons-material/Security';
import { FiPhone } from 'react-icons/fi';

export default function Profile() {
  const { authData, setAuthData } = useAuth();
  const { logout } = useAuthServices(authData, setAuthData);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [currentOptional, setCurrentOptional] = useState({});
  const [activeTerms, setActiveTerms] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isoDate = new Date(authData.user.birthdate);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const maxPhoneDigits = 11; // DDD + número, só números
  function formatPhoneNumber(value) {
    // Remove tudo que não for número
    const cleaned = value.replace(/\D/g, '');

    // Limita a 11 dígitos (DDD + número)
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);

    if (!match) return '';

    let formatted = '';

    if (match[1]) {
      formatted = `(${match[1]}`;
    }

    if (match[1] && match[1].length === 2) {
      formatted += ') ';
    }

    if (match[2]) {
      formatted += match[2];
    }

    if (match[3]) {
      formatted += `-${match[3]}`;
    }

    return formatted;
  }

  function cleanPhoneNumber(value) {
    return value.replace(/\D/g, '');
  }

  const dateForInput = isoDate.toISOString().split('T')[0];
    const handleRequestPasswordReset = () => {
    if (!authData?.user?.email) {
      alert("Email não encontrado. Por favor, verifique suas informações de perfil.");
      return;
    }
    fetch("http://localhost:3000/auth/request-password-reset", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`,
      },
      body: JSON.stringify({ email: authData.user.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Solicitação de redefinição de senha enviada com sucesso. Verifique seu email.");
        } else {
          alert(data.body?.message || "Erro ao solicitar redefinição de senha.");
        }
      })
      .catch((err) => {
        console.error("Erro ao solicitar redefinição de senha:", err);
        alert("Erro ao solicitar redefinição de senha: " + err.message);
      });
  };

  const [editForm, setEditForm] = useState({
    fullname: "",
    email: "",
    birthdate: "",
    phoneNumber: ""
  });
  // Após editar
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [privacySaveSuccess, setPrivacySaveSuccess] = useState(false);


  useEffect(() => {
    if (!authData?.user?._id) {
      navigate("/auth");
      return;
    }

    // Preencher o formulário com dados do usuário
    setEditForm({
      fullname: authData.user.fullname || "",
      email: authData.user.email || "",
      birthdate: authData.user.birthdate ? authData.user.birthdate.split('T')[0] : "",
      phoneNumber: formatPhoneNumber(authData.user.phoneNumber || "")
    });

    const getUserOrders = async (userId) => {
      try {
        const res = await fetch(`http://localhost:3000/orders/user/${userId}`, {
          headers: { "Authorization": `Bearer ${authData.token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.body);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    getUserOrders(authData.user._id);

    // Buscar termos ativos
    fetch("http://localhost:3000/terms/active")
      .then(res => res.json())
      .then(data => {
        setActiveTerms(data.term);

        const acceptedSections = authData.user.acceptedTerms?.sections || [];
        const optionalPrefs = {};
        data.term.sections.forEach(section => {
          if (!section.required) {
            const userSection = acceptedSections.find(s => s.title === section.title);
            optionalPrefs[section.title] = !!(userSection && userSection.acceptedAt);
          }
        });
        setCurrentOptional(optionalPrefs);
      })
      .catch(console.error);

  }, [authData, navigate]);

  const handleLogout = () => {
    logout();
    setAuthData(null);
    localStorage.clear();
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.")) return;

    try {
      const res = await fetch(`http://localhost:3000/users/${authData.user._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        alert("Conta excluída com sucesso.");
        logout(); // sua função de logout já limpa localStorage e redireciona
      } else {
        alert(data.body?.message || "Erro ao excluir conta.");
      }
    } catch (err) {
      alert("Erro ao excluir conta: " + err.message);
    }
  };


  const handleProfileSave = async () => {
    try {
      const birthdateString = editForm.birthdate; // já no formato yyyy-MM-dd

      const res = await fetch(`http://localhost:3000/users/${authData.user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          fullname: editForm.fullname,
          email: editForm.email,
          birthdate: birthdateString,
          phoneNumber: cleanPhoneNumber(editForm.phoneNumber)
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAuthData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            fullname: editForm.fullname,
            email: editForm.email,
            birthdate: birthdateString,
            phoneNumber: cleanPhoneNumber(editForm.phoneNumber),
          },
        }));
        setEditingProfile(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1500);
      } else {
        alert(data.body?.message || "Erro ao atualizar perfil");
      }
    } catch (err) {
      alert("Erro ao atualizar perfil: " + err.message);
    }
  };



  if (loading || !authData?.user) return <Loading />;

  const statusMap = {
    Pending: { icon: <FiClock />, className: styles.pending },
    Completed: { icon: <FiCheckCircle />, className: styles.completed },
    Canceled: { icon: <FiXCircle />, className: styles.canceled },
  };

  return (
    <div className={styles.profilePage}>
      {/* Modal de Preferências */}
      {editingPreferences && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Editar Preferências de Privacidade</h2>
            {activeTerms && (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '1rem' }}>
                {activeTerms.sections.map(section => (
                  <FormControlLabel
                    key={section.title}
                    sx={{
                    alignItems: 'flex-start',
                    marginBottom: '1rem', 
                    width: '100%',
                  }}
                control={
                  <Checkbox
                    checked={section.required ? true : !!currentOptional[section.title]}
                    disabled={section.required}
                    onChange={() => {
                      if (!section.required) {
                        setCurrentOptional(prev => ({
                          ...prev,
                          [section.title]: !prev[section.title]
                        }));
                      }
                    }}
                  />
                }
                    label={
                      <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        paddingRight: '0.5rem',
                        width: '95%',
                        boxSizing: 'border-box',
                        marginLeft: '0.8rem',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s ease',
                        backgroundColor: section.required ? '#ffe6e6' : '#f0f0f0',
                        '&:hover': {
                          backgroundColor: section.required ? '#ffcccc' : '#e0e0e0',
                        },
                        color: 'inherit', // não força cor errada
                      }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#000 !important', }}>
                          {section.required ? "🔒 " : ""}{section.title}
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-line', mt: 1, color: '#000 !important',  }}>
                          {section.content}
                        </Typography>
                      </Box>
                    }
                  />
            ))}
              </div>
            )}  

            <div style={{ marginTop: '1rem' }}>
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  borderColor: "white",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#1976d2",
                    borderRadius: "18px",
                  },
                }}
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:3000/auth/update-terms', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authData.token}`,
                      },
                      body: JSON.stringify({ optionalAccepted: currentOptional }),
                    });

                    const result = await response.json();

                    if (result.success) {
                      setAuthData(prev => ({
                        ...prev,
                        user: {
                          ...prev.user,
                          acceptedTerms: result.acceptedTerms,
                        },
                      }));
                      setEditingPreferences(false);
                      setPrivacySaveSuccess(true);
                      setTimeout(() => setPrivacySaveSuccess(false), 1000);
                    } else {
                      alert('Erro ao atualizar preferências: ' + (result.message || 'Erro desconhecido'));
                    }
                  } catch (err) {
                    alert('Erro ao atualizar preferências: ' + err.message);
                  }
                }}
              >
                Salvar
              </Button>

              <Button
                variant="outlined"
                onClick={() => setEditingPreferences(false)}
                style={{ marginLeft: '1rem' }}
                sx={{
                  borderColor: "red",
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "white",
                    color: "red",
                    borderColor: "red",
                    borderRadius: "18px",
                  },
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de exclusão de perfil */}
      {showDeleteModal && (
        <div
          className="cookieOverlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            color: "white",
            backdropFilter: "blur(2px)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(202, 57, 57, 0.9)",
              padding: "2em",
              borderRadius: "1em",
              width: "90%",
              maxWidth: "500px",
              textAlign: "center",
              animation: "fadeScaleIn 0.3s ease",
              border: "2px solid rgb(255, 255, 255)",
            }}
          >
      <Typography variant="h6" gutterBottom>
        Tem certeza que deseja excluir sua conta?
      </Typography>
      <Typography variant="body2" sx={{ color: "#f5f5f5" }}>
        Esta ação é irreversível e apagará todos os seus dados.
      </Typography>

      <Stack direction="row" spacing={2} mt={3} justifyContent="center">
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            try {
              const res = await fetch(`http://localhost:3000/users/${authData.user._id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${authData.token}`,
                },
              });

              const data = await res.json();

              if (data.success) {
                setShowDeleteModal(false);
                alert("Conta excluída com sucesso.");
                logout();
                navigate("/auth");
              } else {
                alert(data.body?.message || "Erro ao excluir conta.");
              }
            } catch (err) {
              alert("Erro ao excluir conta: " + err.message);
            }
          }}
        >
          Sim, excluir
        </Button>

        <Button
          variant="outlined"
          onClick={() => setShowDeleteModal(false)}
            sx={{
              borderColor: "red",
              backgroundColor: "red",
              color: "white",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "white",
                color: "red",
                borderColor: "red",
                borderRadius: "18px",
              },
            }}
        >
          Cancelar
        </Button>
      </Stack>
    </div>
  </div>
)}



      {/* Modal de edição de perfil */}
      {editingProfile && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Editar Perfil</h2>
            <label>
              Nome Completo:
              <input
                type="text"
                value={editForm.fullname}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, fullname: e.target.value }))
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </label>
            <label>
              Data de Nascimento:
              <input
                type="date"
                value={editForm.birthdate || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, birthdate: e.target.value }))}
              />

            </label>

            <label>
              Celular:
              <input
                type="text"
                value={editForm.phoneNumber}
                onChange={(e) => {
                  const rawDigits = e.target.value.replace(/\D/g, '');
                  if (rawDigits.length > maxPhoneDigits) {
                    setPhoneError(`Telefone não pode ter mais que ${maxPhoneDigits} dígitos.`);
                    // NÃO atualiza o estado para evitar apagar o campo
                    return;
                  }
                  setPhoneError(''); // Limpa erro se corrigido
                  setEditForm((prev) => ({
                    ...prev,
                    phoneNumber: formatPhoneNumber(e.target.value),
                  }));
                }}
                placeholder="(11) 91234-5678"
              />
            </label>
            {phoneError && (
              <span style={{ background:'#93e4c1' , color: 'red', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block', borderRadius: '4px', padding: '0.25rem' }}>
                {phoneError}
              </span>
            )}


              <Button variant="contained" color="secondary  " onClick={handleRequestPasswordReset}>Redefinir Senha</Button>

            <div style={{ marginTop: "1rem" }}>
              <Button variant="contained" color="secondary" onClick={handleProfileSave}
                sx={{
                  borderColor: "white",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#1976d2",
                    borderRadius: "18px",
                  },
                }}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                onClick={() => setEditingProfile(false)}
                style={{ marginLeft: "1rem" }}
                sx={{
                  borderColor: "red",
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "white",
                    color: "red",
                    borderColor: "red",
                    borderRadius: "18px",
                  },
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModalContent}>
            <FiCheckCircle size={36} color="green" style={{ marginBottom: "1rem" }} />
            <h2 style={{ color: "green" }}>Perfil atualizado com sucesso!</h2>
          </div>
        </div>
      )}

      {privacySaveSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModalContent}>
            <FiCheckCircle size={36} color="green" style={{ marginBottom: "1rem" }} />
            <h2 style={{ color: "green" }}>Preferências atualizadas com sucesso!</h2>
          </div>
        </div>
      )}





      {/* Conteúdo principal */}
<div className={styles.pageContainer}>
  <div className={styles.profileContainer}>

    <div className={styles.topSection}>
      {/* 🧑 Dados do usuário */}
      <div className={styles.userSection}>
        <div className={styles.userNameBox}>
          <AccountBoxIcon className={styles.icon} />
          <h1>{authData.user.fullname}</h1>
        </div>

        <div className={styles.infoItem}>
          <div>
            <div className={styles.label}>
              <EmailIcon className={styles.icon} />
              Email:
              </div>
            <div className={styles.value}>{authData.user.email}</div>
          </div>
        </div>

        <div className={styles.infoItem}>
          
          <div>
            <div className={styles.label}>
              <CalendarTodayIcon className={styles.icon} />
              Data de Nascimento:
              </div>
            <div className={styles.value}>
              {authData.user.birthdate
                ? new Date(new Date(authData.user.birthdate).getTime() + 24 * 60 * 60 * 1000)
                    .toLocaleDateString("pt-BR")
                : "Não informado"}
            </div>
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.label}>
            <FiPhone size={24} style={{ marginRight: '0.5rem' }} />
            Celular:
          </div>
          <div className={styles.value}>
            {authData.user.phoneNumber 
              ? formatPhoneNumber(authData.user.phoneNumber) 
              : "Não informado"}
          </div>
        </div>



        <Button
          variant="contained"
          className={styles.editProfileButton}
          onClick={() => setEditingProfile(true)}
          color="secondary"
        >
          Editar Perfil
        </Button>
      </div>

      {/* 🔒 Preferências */}
      <div className={styles.preferencesSection}>
        <div className={styles.infoItem}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiClipboard size={24} />
            Suas preferências:
          </h2>
          <ul>
            {(authData.user.acceptedTerms?.sections || []).map((section) => (
              <li key={section.title}>
                {section.required ? '🔒' : section.acceptedAt ? '✅' : '❌'} {section.title}
              </li>
            ))}
          </ul>

          <Button
            variant="contained"
            className={styles.privacyButton}
            color="secondary"
            onClick={() => {
              const optionalPrefs = {};
              (authData.user.acceptedTerms?.sections || []).forEach(section => {
                if (!section.required) {
                  optionalPrefs[section.title] = !!section.acceptedAt;
                }
              });
              setCurrentOptional(optionalPrefs);
              setEditingPreferences(true);
            }}
          >
            Editar Preferências de Privacidade
          </Button>
        </div>
      </div>

      {authData?.user?.role === "admin" && (
        <div className={styles.adminPanel}>
          <div className={`${styles.infoItem} ${styles.cardHover}`}>
            <h2><SecurityIcon style={{ marginRight: 6 }} /> Área Administrativa</h2>
            <div className={styles.actionsRow}>
              <Button
                variant="contained"
                color="secondary"
                className={styles.privacyButton}
                onClick={() => navigate("/admin/terms")}
              >
                ⚙️ Gerenciar Termos de Uso
              </Button>
              <Button
                variant="contained"
                color="secondary"
                className={styles.privacyButton}
                onClick={() => navigate("/admin/users-terms")}
              >
                Ver Usuários e Termos
              </Button>
            </div>
          </div>
        </div>
      )}


              {/* <button className={styles.adminButton}>
          ⚙️ Gerenciar Termos de Uso
        </button>

        <button className={styles.adminButton}>
          👥 Ver Usuários e Termos
        </button> */}

        {/* <button className={styles.adminButton}>
          ➕ Novo Termo
        </button> */}

        {/* <div className={styles.statsBox}>
          <span>📄 Termos:</span>
          <span>5 ativos</span>
        </div> */}

        {/* <div className={styles.statsBox}>
          <span>👤 Usuários:</span>
          <span>12 registrados</span>
        </div> */}

    {/* 🚀 Ações */}

      <div className={styles.actionsPanel}>
        <Button
          variant="contained"
          onClick={() => setShowLogoutConfirm(true)}
          className={styles.logoutButton}
          startIcon={<FiLogOut />}
        >
          Logout
        </Button>

        <Button
          variant="outlined"
          className={styles.deleteButton}
          startIcon={<DeleteIcon />}
          onClick={() => setShowDeleteModal(true)}
        >
          Excluir Conta
        </Button>
      </div>
    </div>

    {/* Modal de confirmação de logout */}
    <Modal
      open={showLogoutConfirm}
      onClose={() => setShowLogoutConfirm(false)}
      aria-labelledby="logout-confirm-title"
      aria-describedby="logout-confirm-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: '#fff',
        p: 4,
        borderRadius: 2,
        boxShadow: 24,
        width: '90%',
        maxWidth: 400,
      }}>
        <Typography id="logout-confirm-title" variant="h6" gutterBottom>
          Tem certeza que deseja sair?
        </Typography>
        <Typography id="logout-confirm-description" sx={{ mb: 3 }}>
          Você será desconectado da sua conta.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
          >
            Sair
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowLogoutConfirm(false)}
              sx={{
                  borderColor: "red",
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  ml: 2,
                  "&:hover": {
                    backgroundColor: "white",
                    color: "red",
                    borderColor: "red",
                    borderRadius: "18px",
                  },
                }}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Modal>


    {/* 🍽️ Pedidos */}
    <div className={styles.ordersContainer}>
      {orders.length > 0 ? (
        orders.map((order) => {
          const statusInfo = statusMap[order.pickupStatus] || {};
          return (
            <div key={order._id} className={styles.orderContainer}>
              <p className={`${styles.pickupStatus} ${statusInfo.className || ""}`}>
                {statusInfo.icon} {order.pickupStatus || "Unknown"}
              </p>
              <h3>{order.pickupTime}</h3>
              {order.orderItems.map((item) => (
                <div key={item._id}>
                  <h4>{item.itemDetails[0]?.name}</h4>
                  <p>Quantidade: {item.quantity}</p>
                </div>
              ))}
            </div>
          );
        })
      ) : (
        <div>
          <p>Você ainda não tem pedidos.</p>
          <Link to="/plates" className={styles.platesLink}>
            Clique aqui e conheça nossos pratos!
          </Link>
        </div>
      )}
    </div>
  </div>
</div>

    </div>
  );
} 

