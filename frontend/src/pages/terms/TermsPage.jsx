import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button, Paper, Typography, CircularProgress } from "@mui/material";

export default function TermsPage() {
  const { authData } = useAuth();
  const navigate = useNavigate();
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTerms() {
      try {
        const res = await fetch("http://localhost:3000/auth/terms/active");
        const data = await res.json();
        if (data.success) setTerms(data.term);
        else setError("Failed to load terms.");
      } catch (err) {
        setError("Error fetching terms.");
      } finally {
        setLoading(false);
      }
    }

    fetchTerms();
  }, []);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await fetch("http://localhost:3000/auth/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData?.token}`
        }
      });

      const result = await res.json();

      if (result.success) {
        navigate("/profile");
      } else {
        setError("Erro ao aceitar os termos.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!terms) return <p>Nenhum termo de uso disponível.</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Termos de Uso - v{terms.version}
      </Typography>

      <Paper elevation={2} style={{ padding: "1.5rem", marginBottom: "2rem", whiteSpace: "pre-line" }}>
        {terms.content}
      </Paper>

      <Button
        variant="contained"
        color="primary"
        onClick={handleAccept}
        disabled={accepting}
      >
        {accepting ? "Aceitando..." : "Aceitar Termos e Prosseguir"}
      </Button>
    </div>
  );
}
