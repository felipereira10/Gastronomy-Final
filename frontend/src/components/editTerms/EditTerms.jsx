import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../Loading/Loading";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

export default function EditTerms() {
  const { authData } = useAuth();
  const [termsList, setTermsList] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [version, setVersion] = useState("");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTerms = async () => {
    try {
      const res = await axios.get("http://localhost:3000/terms", {
        headers: { Authorization: `Bearer ${authData.token}` },
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

  const handleAddSection = () => {
    setSections([...sections, { title: "", content: "", required: true }]);
  };

  const handleRemoveSection = (index) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  const handleSectionChange = (index, key, value) => {
    const updated = [...sections];
    updated[index][key] = value;
    setSections(updated);
  };

  const handleEdit = (term) => {
    setSelectedTerm(term);
    setVersion(term.version);
    setSections(term.sections || []);
  };

  const handleCancelEdit = () => {
    setSelectedTerm(null);
    setVersion("");
    setSections([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTerm) {
        // Atualizar termo existente
        await axios.put(
          `http://localhost:3000/terms/${selectedTerm._id}`,
          { version, sections },
          { headers: { Authorization: `Bearer ${authData.token}` } }
        );
      } else {
        // Criar novo termo
        await axios.post(
          "http://localhost:3000/terms",
          { version, sections },
          { headers: { Authorization: `Bearer ${authData.token}` } }
        );
      }

      handleCancelEdit();
      fetchTerms();
    } catch (err) {
      console.error("Erro ao salvar termo:", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        {selectedTerm ? "Editar Termo" : "Criar Novo Termo"}
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

          {sections.map((section, index) => (
            <Paper
              key={index}
              sx={{
                padding: 2,
                marginBottom: 2,
                backgroundColor: "#f9f9f9",
              }}
              elevation={1}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Seção {index + 1}</Typography>
                <IconButton
                  onClick={() => handleRemoveSection(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <TextField
                fullWidth
                label="Título"
                value={section.title}
                onChange={(e) =>
                  handleSectionChange(index, "title", e.target.value)
                }
                sx={{ marginBottom: 2, marginTop: 1 }}
                required
              />

              <TextField
                fullWidth
                label="Conteúdo"
                multiline
                rows={4}
                value={section.content}
                onChange={(e) =>
                  handleSectionChange(index, "content", e.target.value)
                }
                sx={{ marginBottom: 2 }}
                required
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={section.required}
                    onChange={(e) =>
                      handleSectionChange(index, "required", e.target.checked)
                    }
                  />
                }
                label="Obrigatório"
              />
            </Paper>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddSection}
            sx={{ marginBottom: 2 }}
            variant="outlined"
          >
            Adicionar Seção
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              {selectedTerm ? "Salvar Alterações" : "Publicar Novo Termo"}
            </Button>

            {selectedTerm && (
              <Button variant="outlined" color="secondary" onClick={handleCancelEdit}>
                Cancelar Edição
              </Button>
            )}
          </Box>
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1">
                  Versão: {term.version} {term.active ? "(Ativo)" : "(Inativo)"}
                </Typography>
                <IconButton
                  onClick={() => handleEdit(term)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </Box>

              {term.sections?.map((sec, idx) => (
                <Box key={idx} sx={{ marginTop: 1 }}>
                  <Typography variant="subtitle2">
                    {sec.title} {sec.required ? "(Obrigatório)" : "(Opcional)"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line" }}
                  >
                    {sec.content}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
