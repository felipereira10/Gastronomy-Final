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
} from "@mui/material";
import { Box } from "@mui/system";

export default function TermsPage() {
  const { authData, setAuthData } = useAuth(); // ✅ Corrigido
  const navigate = useNavigate();

  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [optionalAccepted, setOptionalAccepted] = useState({});

  // ✅ Protege contra acesso sem login
  useEffect(() => {
    if (!authData?.token) {
      navigate("/login");
    }
  }, [authData, navigate]);

  useEffect(() => {
    async function fetchTerms() {
      try {
        const res = await fetch("http://localhost:3000/terms/active");
        const data = await res.json();

        if (data.success) {
          setTerms(data.term);

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
    setError("");

    try {
      const res = await fetch("http://localhost:3000/auth/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData?.token}`,
        },
        body: JSON.stringify({
          optionalAccepted,
        }),
      });

      const result = await res.json();

      if (result.success) {
        const updatedAuth = {
          ...authData,
          user: {
            ...authData.user,
            acceptedTerms: {
              version: terms.version,
              acceptedAt: new Date().toISOString(),
              sections: terms.sections.map((section) => ({
                title: section.title,
                required: section.required,
                acceptedAt: section.required || optionalAccepted[section.title]
                  ? new Date().toISOString()
                  : null,
              })),
            }

          },
        };

        localStorage.setItem("auth", JSON.stringify(updatedAuth));
        setAuthData(updatedAuth);

        navigate("/profile");
      } else {
        setError(result.message || "Erro ao aceitar os termos.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setAccepting(false);
    }
  };

  // 🚩 Carregando
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem" }}>
        <CircularProgress />
      </div>
    );
  }

  // 🚩 Erro
  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // 🚩 Sem termos
  if (!terms) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        Nenhum termo de uso disponível.
      </Typography>
    );
  }

  // ✅ Página carregada corretamente
  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Termos de Uso - v{terms.version}
      </Typography>

      {terms.sections?.map((section, idx) => (
        <Paper
          key={idx}
          elevation={3}
          style={{
            padding: "1.5rem",
            marginBottom: "1rem",
            whiteSpace: "pre-line",
            backgroundColor: section.required ? "#f9f9f9" : "#ffffff",
          }}
        >
          <Typography variant="h6" gutterBottom>
            {section.title} {section.required ? "(Obrigatório)" : "(Opcional)"}
          </Typography>
          <Typography sx={{ mb: 1 }}>{section.content || "Conteúdo não disponível"}</Typography>

          {!section.required && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!optionalAccepted[section.title]}
                  onChange={(e) =>
                    setOptionalAccepted((prev) => ({
                      ...prev,
                      [section.title]: e.target.checked,
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
      ))}

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAccept}
          disabled={accepting}
        >
          {accepting ? "Aceitando..." : "Aceitar Termos e Prosseguir"}
        </Button>
      </Box>
    </div>
  );
}