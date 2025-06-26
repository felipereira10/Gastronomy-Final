// ... imports
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Checkbox, FormControlLabel, Stack } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext.jsx";
import useAuthServices from "../../services/auth.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import styles from "./page.module.css";
import { FiLogOut, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

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

  const [editForm, setEditForm] = useState({
    fullname: "",
    email: "",
    birthdate: ""
  });
  // Após editar
  const [saveSuccess, setSaveSuccess] = useState(false);


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
        ? new Date(authData.user.birthdate).toISOString().split("T")[0]
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
        <div className={styles.cookieOverlay}>
          <div className={styles.cookieModalContent}>
            <h2>Editar Preferências de Privacidade</h2>
            {activeTerms && activeTerms.sections.map(section => (
              <FormControlLabel
                key={section.title}
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
                label={`${section.required ? "🔒" : ""} ${section.title}`}
              />
            ))}

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

      {/* Modal de edição de perfil */}
      {editingProfile && (
        <div className={styles.cookieOverlay}>
          <div className={styles.cookieModalContent}>
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
                value={editForm.birthdate}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, birthdate: e.target.value }))
                }
              />
            </label>

            <div style={{ marginTop: "1rem" }}>
              <Button variant="contained" onClick={handleProfileSave}
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
        <div className={styles.cookieOverlay}>
          <div className={styles.successModalContent}>
            <FiCheckCircle size={36} color="green" style={{ marginBottom: "1rem" }} />
            <h2 style={{ color: "green" }}>Perfil atualizado com sucesso!</h2>
          </div>
        </div>
      )}




      {/* Conteúdo principal */}
      <div className={styles.profileContainer}>
        <div className={styles.userInfo}>
          <h1>{authData.user.fullname}</h1>
          <h3>{authData.user.email}</h3>
          <div style={{ marginTop: '1rem' }}>
            <h4>📋 Suas preferências:</h4>
            <ul>
              {(authData.user.acceptedTerms?.sections || []).map((section) => (
                <li key={section.title}>
                  {section.required ? '🔒' : section.acceptedAt ? '✅' : '❌'} {section.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setEditingProfile(true)}
          >
            Editar Perfil
          </Button>

          {authData.user.role === "admin" && (
            <>
              <Button variant="outlined" onClick={() => navigate("/admin/terms")}>
                Gerenciar Termos de Uso
              </Button>
              <Button variant="outlined" onClick={() => navigate('/admin/users-terms')}>
                Ver usuários e termos
              </Button>
            </>
          )}

          <Button
            variant="contained"
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

          <Button
            variant="contained"
            onClick={handleLogout}
            className={styles.logoutButton}
            startIcon={<FiLogOut />}
          >
            Logout
          </Button>
        </div>

        <div className={styles.ordersContainer}>
          {orders.length > 0 ? (
            orders.map((order) => {
              const statusInfo = statusMap[order.pickupStatus];
              return (
                <div key={order._id} className={styles.orderContainer}>
                  <p className={`${styles.pickupStatus} ${statusInfo?.className || ''}`}>
                    {statusInfo?.icon} {order.pickupStatus || 'Unknown'}
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
              <br/><br/><br/><br/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
