import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  List,
  ListItem
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../Loading/Loading";

export default function EditTerms() {
  const { authData } = useAuth();
  const [version, setVersion] = useState("");
  const [content, setContent] = useState("");
  const [termsList, setTermsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTerms = async () => {
    try {
      const res = await axios.get("http://localhost:3000/auth/terms", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setTermsList(res.data.terms);
    } catch (err) {
      console.error("Erro ao buscar termos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authData?.token) fetchTerms();
  }, [authData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3000/auth/terms",
        { version, content },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );
      setVersion("");
      setContent("");
      fetchTerms();
    } catch (err) {
      console.error("Erro ao salvar novo termo:", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Termos de Uso
      </Typography>

      <Paper sx={{ padding: 4, marginBottom: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Versão"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            sx={{ marginBottom: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Conteúdo dos Termos"
            multiline
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ marginBottom: 2 }}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Publicar Novo Termo
          </Button>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Histórico de Termos
      </Typography>
      <List>
        {(termsList || []).map((term) => (
          <ListItem key={term._id}>
            <Paper
              sx={{
                padding: 2,
                width: "100%",
                backgroundColor: term.active ? "#e3f2fd" : "#f5f5f5",
              }}
            >
              <Typography variant="subtitle1">
                Versão: {term.version} {term.active ? "(Ativo)" : "(Inativo)"}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {term.content}
              </Typography>
            </Paper>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
