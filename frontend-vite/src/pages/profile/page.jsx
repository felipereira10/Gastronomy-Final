import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import useAuthServices from "../../services/auth";
import Loading from "../../components/loading/Loading.jsx";

export default function Profile() {
  const { logout } = useAuthServices();
  const navigate = useNavigate();
  const authData = JSON.parse(localStorage.getItem("auth")) || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // substitui orderLoading

  const getUserOrders = async (userId) => {
    try {
      const res = await fetch(`http://localhost:3000/orders/user/${userId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
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
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <h1>{authData.user.fullname}</h1>
      <h3>{authData.user.email}</h3>
      <Button variant="contained" onClick={handleLogout}>
        Logout
      </Button>

      <h2>Pedidos:</h2>
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order._id}>
            <p>Pedido #{order._id}</p>
          </div>
        ))
      ) : (
        <p>Você ainda não tem pedidos.</p>
      )}
    </>
  );
}