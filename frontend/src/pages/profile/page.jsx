// ... imports
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
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
  const [showTermsModal, setShowTermsModal] = useState(false);



  const getUserOrders = async (userId) => {
    try {
      const res = await fetch(`http://localhost:3000/orders/user/${userId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (!authData?.user?._id) {
    navigate("/auth");
  } else {
    getUserOrders(authData.user._id);
  }

  if (authData?.activeTerms) {
    setShowTermsModal(true);
  }
}, [authData, navigate]);

  

  const handleLogout = () => {
    logout();
    setAuthData(null);
    localStorage.clear();
    navigate("/auth");
  };

  const handlePreferenceChange = (type) => {
    setCookiePreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  


  if (loading) return <Loading />;

  const statusMap = {
    Pending: { icon: <FiClock />, className: styles.pending },
    Completed: { icon: <FiCheckCircle />, className: styles.completed },
    Canceled: { icon: <FiXCircle />, className: styles.canceled },
  };

  return (

    <div className={styles.profilePage}>

      {/* Modal com Usuários e Termos */}
      {authData.user.role === 'admin' && (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate('/admin/users-terms')}
        >
          Ver usuários e termos
        </Button>
      )}

      {/* Modal com Termos de Uso */}
      {showTermsModal && (
        <div className={styles.cookieOverlay}>
          <div className={styles.cookieModalContent}>
            <h2>📝 Atualização nos Termos de Uso</h2>
            <p>Você precisa aceitar os novos termos para continuar:</p>
            <pre style={{ whiteSpace: "pre-wrap", maxHeight: "200px", overflowY: "scroll" }}>
              {authData.activeTerms?.content}
            </pre>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await axios.post(
                    "http://localhost:3000/auth/accept-terms",
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${authData.token}`,
                      },
                    }
                  );

                  // Atualiza authData no contexto
                  setAuthData((prev) => ({
                    ...prev,
                    user: {
                      ...prev.user,
                      acceptedTerms: {
                        version: authData.activeTerms.version,
                        acceptedAt: new Date()
                      }
                    },
                    activeTerms: null
                  }));

                  setShowTermsModal(false);
                } catch (err) {
                  alert("Erro ao aceitar os termos.");
                }
              }}
              color="primary"
              sx={{ marginTop: 2 }}
            >
              Aceitar Termos
            </Button>
          </div>
        </div>
      )}
      

      {/* Conteúdo principal */}
      <div className={styles.profileContainer}>
        <div className={styles.userInfo}>
          <h1>{authData.user.fullname}</h1>
          <h3>{authData.user.email}</h3>
        </div>

        <div className={styles.actionsRow}>
          <Button
            variant="contained"
            onClick={handleLogout}
            className={styles.logoutButton}
            startIcon={<FiLogOut />}
          >
            Logout
          </Button>

          {authData?.user?.role === "admin" && (
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/terms")}
              style={{ marginTop: "1rem" }}
            >
              Gerenciar Termos de Uso
            </Button> )}
        </div>

        <div className={styles.ordersContainer}>
          {orders.length > 0 ? (
            orders.map((order) => {
              const statusInfo = statusMap[order.pickupStatus];
              return (
                <div key={order._id} className={styles.orderContainer}>
                  <p className={`${styles.pickupStatus} ${statusInfo.className}`}>
                    {statusInfo.icon} {order.pickupStatus}
                  </p>
                  <h3>{order.pickupTime}</h3>
                  {order.orderItems.map((item) => (
                    <div key={item._id}>
                      <h4>{item.itemDetails[0]?.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <div>
              <p>You don't have any orders yet.</p>
              <Link to="/plates" className={styles.platesLink}>
                Click here and check out our specialties!
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
