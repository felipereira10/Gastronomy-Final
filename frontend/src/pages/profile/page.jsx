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
  }, [authData, navigate]);

  const handleLogout = () => {
    logout();
    setAuthData(null);
    localStorage.removeItem("auth");
    navigate("/auth");
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.pageContainer}>
      <div>
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
          orders.map((order) => (
            <div key={order._id} className={styles.orderContainer}>
              {order.pickupStatus === 'Pending' && (
                <p className={`${styles.pickupStatus} ${styles.pending}`}>
                  <FiClock />
                  {order.pickupStatus}
                </p>
              )}

              {order.pickupStatus === 'Completed' && (
                <p className={`${styles.pickupStatus} ${styles.completed}`}>
                  <FiCheckCircle />
                  {order.pickupStatus}
                </p>
              )}

              {order.pickupStatus === 'Canceled' && (
                <p className={`${styles.pickupStatus} ${styles.canceled}`}>
                  <FiXCircle />
                  {order.pickupStatus}
                </p>
              )}

              <h3>{order.pickupTime}</h3>
              {order.orderItems.map((item) => (
                <div key={item._id}>
                  <h4>{item.itemDetails[0]?.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                </div>
              ))}
            </div>
          ))
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
  );
}
