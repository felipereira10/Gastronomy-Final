// ... imports
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Checkbox, FormControlLabel, Stack } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext.jsx";
import useAuthServices from "../../services/auth.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import styles from "./page.module.css";
import { FiLogOut, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Box from '@mui/material/Box';


export default function Profile() {
  const { authData, setAuthData } = useAuth();
  const { logout } = useAuthServices(authData, setAuthData);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [editingPreferences, setEditingPreferences] = useState(false);
  const [currentOptional, setCurrentOptional] = useState({});
  const [activeTerms, setActiveTerms] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isoDate = new Date(authData.user.birthdate);
  const dateForInput = isoDate.toISOString().split('T')[0];


  const [editForm, setEditForm] = useState({
    fullname: "",
    email: "",
    birthdate: ""
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
      birthdate: authData.user.birthdate
        ? authData.user.birthdate.split('T')[0]
        : ""
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
          birthdate: birthdateString, // Envie como string, não como Date
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
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {section.required ? "🔒 " : ""}{section.title}
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-line', mt: 1 }}>
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
                color="primary"
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    backgroundColor: "white",
                    color: "green",
                    borderColor: "green",
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
            color: "white",
            borderColor: "white",
            "&:hover": {
              backgroundColor: "white",
              color: "red",
              borderColor: "red",
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

            <div style={{ marginTop: "1rem" }}>
              <Button variant="contained" color="secondary" onClick={handleProfileSave}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    backgroundColor: "white",
                    color: "green",
                    borderColor: "green",
                  },
                }}
              >
                Salvar
              </Button>
              <Button
                variant="outlined"
                onClick={() => setEditingProfile(false)}
                style={{ marginLeft: "1rem" }}
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
          <h1>{authData.user.fullname}</h1>
        </div>
        <div className={styles.infoItem}>
          <EmailIcon className={styles.icon} />
          <div>
            <div className={styles.label}>Email:</div>
            <div className={styles.value}>{authData.user.email}</div>
          </div>
        </div>

        <div className={styles.infoItem}>
          <CalendarTodayIcon className={styles.icon} />
          <div>
            <div className={styles.label}>Nascimento:</div>
            <div className={styles.value}>
              {authData.user.birthdate
                ? new Date(new Date(authData.user.birthdate).getTime() + 24 * 60 * 60 * 1000)
                    .toLocaleDateString("pt-BR")
                : "Não informado"}
            </div>
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
          <h4>📋 Suas preferências:</h4>
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
      {authData.user.role === "admin" && (
      <div className={styles.adminPanel}>
        <h3>Área Administrativa</h3>

      <div className={styles.actionsRow}>
        {authData.user.role === "admin" && (
          <>
            <Button variant="contained" color="secondary" onClick={() => navigate("/admin/terms")}>
              ⚙️ Gerenciar Termos de Uso
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate("/admin/users-terms")}>
              Ver Usuários e Termos
            </Button>
          </>
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
      </div>
    </div>
      )}
    

    {/* 🚀 Ações */}

      <div className={styles.actionsPanel}>
        <Button
          variant="contained"
          onClick={handleLogout}
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

