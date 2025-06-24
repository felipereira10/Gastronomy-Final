import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Button, 
  Paper, 
  Typography, 
  CircularProgress, 
  Checkbox, 
  FormControlLabel, 
  Box 
} from "@mui/material";

export default function TermsPage() {
  const { authData } = useAuth();
  const navigate = useNavigate();
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [optionalAccepted, setOptionalAccepted] = useState({});

  useEffect(() => {
    async function fetchTerms() {
      try {
        const res = await fetch("http://localhost:3000/terms/active");
        const data = await res.json();
        if (data.success) {
          setTerms(data.term);

          // Inicializa os opcionais como não aceitos
          const optional = {};
          data.term.sections?.forEach((sec) => {
            if (!sec.required) {
              optional[sec.title] = false;
            }
          });
          setOptionalAccepted(optional);
        } else {
          setError("Falha ao carregar os termos.");
        }
      } catch (err) {
        setError("Erro ao buscar os termos.");
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
        },
        body: JSON.stringify({
          optionalAccepted: optionalAccepted
        })
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

    {terms.sections && terms.sections.length > 0 ? (
      terms.sections.map((section, idx) => (
        <Paper key={idx} elevation={2} style={{ padding: "1.5rem", marginBottom: "1rem", whiteSpace: "pre-line" }}>
          <Typography variant="h6" gutterBottom>{section.title}</Typography>
          <Typography>{section.content || "Conteúdo não disponível"}</Typography>

          {/* Checkbox só para os termos opcionais */}
          {!section.required && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!optionalAccepted[section.title]}
                  onChange={e =>
                    setOptionalAccepted(prev => ({
                      ...prev,
                      [section.title]: e.target.checked
                    }))
                  }
                  name={section.title}
                  color="primary"
                />
              }
              label="Aceito este termo opcional"
            />
          )}
        </Paper>
      ))
          ) : (
            <Paper elevation={2} style={{ padding: "1.5rem", marginBottom: "2rem", whiteSpace: "pre-line" }}>
              {terms.content}
            </Paper>
          )}


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
