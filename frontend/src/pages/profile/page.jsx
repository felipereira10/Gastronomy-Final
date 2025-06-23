// ... imports
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
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
  const [showCookieModal, setShowCookieModal] = useState(false);

  const [cookiePreferences, setCookiePreferences] = useState({
    essential: false,
    functional: false,
    analytics: false,
    personalData: false,
  });

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
  } else if (!authData?.user?.acceptedTerms) {
    navigate("/terms");
  } else {
    getUserOrders(authData.user._id);
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

  const handleAcceptCookies = () => {
    const anyAccepted = Object.values(cookiePreferences).some((val) => val === true);
    if (!anyAccepted) {
      alert("You must accept at least one data usage option.");
      return;
    }

    localStorage.setItem("cookiesAccepted", "true");
    localStorage.setItem("cookiePreferences", JSON.stringify(cookiePreferences));
    setCookiesAccepted(true);
    setShowCookieModal(false);
  };

  const handleReopenModal = () => {
    setShowCookieModal(true);
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookiesAccepted", "false");
    localStorage.removeItem("cookiePreferences");
    setCookiesAccepted(false);
    localStorage.clear();
    navigate("/auth");
  };

  if (loading) return <Loading />;

  const statusMap = {
    Pending: { icon: <FiClock />, className: styles.pending },
    Completed: { icon: <FiCheckCircle />, className: styles.completed },
    Canceled: { icon: <FiXCircle />, className: styles.canceled },
  };

  return (
    <div className={styles.pageContainer}>
      {/* Modal de Cookies com checklist */}
      {showCookieModal && (
        <div className={styles.cookieOverlay}>
          <div className={styles.cookieModalContent}>
            <h2>🍪 Cookie & Data Preferences</h2>
            <p>Select the types of data we can use:</p>
            <div className={styles.cookieChecklist}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cookiePreferences.essential}
                    onChange={() => handlePreferenceChange("essential")}
                    color="primary"
                  />
                }
                label="Essential – Required for site functionality"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cookiePreferences.functional}
                    onChange={() => handlePreferenceChange("functional")}
                    color="primary"
                  />
                }
                label="Functional – Save preferences and UI settings"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cookiePreferences.analytics}
                    onChange={() => handlePreferenceChange("analytics")}
                    color="primary"
                  />
                }
                label="Analytics – Collect usage statistics"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cookiePreferences.personalData}
                    onChange={() => handlePreferenceChange("personalData")}
                    color="primary"
                  />
                }
                label="Personal Data – Store name, email and order history"
              />
            </div>

            <div className={styles.cookieActions}>
              <Button variant="contained" onClick={handleAcceptCookies} color="primary">
                Accept and close
              </Button>
              <Button variant="outlined" onClick={handleRejectAll} color="secondary">
                Reject all and logout
              </Button>
              <p
                className={styles.privacyLink}
                onClick={() => setShowPrivacyModal(true)}
              >
                See full privacy policy
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal com Política de Privacidade */}
      {showPrivacyModal && (
        <div className={styles.cookieOverlay}>
          <div className={styles.cookieModalContent}>
            <h2>Privacy Policy</h2>
            <p>We use the following data types depending on your preferences:</p>
            <ul>
              <li><strong>Essential:</strong> Login, navigation and basic functionality.</li>
              <li><strong>Functional:</strong> Interface preferences and behavior memory.</li>
              <li><strong>Analytics:</strong> Website usage statistics and performance data.</li>
              <li><strong>Personal Data:</strong> Full name, email, and order history for personalization.</li>
            </ul>
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

        <div className={styles.actionsRow}>
          <Button
            variant="contained"
            onClick={handleLogout}
            className={styles.logoutButton}
            startIcon={<FiLogOut />}
          >
            Logout
          </Button>

          {cookiesAccepted && (
            <Button
              variant="outlined"
              onClick={handleReopenModal}
              color="secondary"
              className={styles.preferenceButton}
            >
              Change Cookie Preferences
            </Button>
          )}
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
