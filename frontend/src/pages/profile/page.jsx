// ... imports
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext.jsx";
import useAuthServices from "../../services/auth.jsx";
import Loading from "../../components/loading/Loading.jsx";
import styles from "./page.module.css";
import { FiLogOut, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function Profile() {
  const { authData, setAuthData } = useAuth();
  const { logout } = useAuthServices(authData, setAuthData);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

    const hasAcceptedCookies = localStorage.getItem("cookiesAccepted");
    if (hasAcceptedCookies === "true") {
      setCookiesAccepted(true);
    } else if (hasAcceptedCookies === "false") {
      localStorage.clear();
      navigate("/auth");
    }
  }, [authData, navigate]);

  const handleLogout = () => {
    logout();
    setAuthData(null);
    localStorage.clear();
    navigate("/auth");
  };

  const handleAcceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setCookiesAccepted(true);
  };

  if (loading) return <Loading />;

  const statusMap = {
    Pending: { icon: <FiClock />, className: styles.pending },
    Completed: { icon: <FiCheckCircle />, className: styles.completed },
    Canceled: { icon: <FiXCircle />, className: styles.canceled },
  };

  return (
    <div className={styles.pageContainer}>
      {/* Modal de Cookies */}
      {!cookiesAccepted && (
        <div className={styles.cookieOverlay}>
          <div className={styles.cookieModalContent}>
            <h2>🍪 Cookie Policy</h2>
            <p>
              We use cookies to improve your experience and efficiently process your orders.
              Learn more in our{" "}
              <span className={styles.privacyLink} onClick={() => setShowPrivacyModal(true)}>
                Privacy Portal
              </span>.
            </p>
            <div className={styles.cookieActions}>
              <Button variant="contained" onClick={handleAcceptCookies} color="primary">
                Accept and close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal com Política de Privacidade */}
      {showPrivacyModal && (
        <div className={styles.cookieOverlay}>
          <div className={styles.cookieModalContent}>
            <h2>Privacy Policy</h2>
            <p>
              We use cookies to improve your experience and efficiently process your orders.
            </p>
            <p>
              We use cookies to collect information about how you interact with our website and allow us to remember you.
              This information is used to improve and customize your browsing experience and for analytics.
            </p>
            <p>
              By accepting, you agree to our use of cookies as described in this policy. For full details,
              visit our official terms or contact our support.
            </p>
            <Button variant="contained" onClick={() => setShowPrivacyModal(false)}>
              Close
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

        <Button
          variant="contained"
          onClick={handleLogout}
          className={styles.logoutButton}
          startIcon={<FiLogOut />}
        >
          Logout
        </Button>

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
