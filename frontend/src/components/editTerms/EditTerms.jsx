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
    Snackbar,
    Alert,
  } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../Loading/Loading";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSection({ index, section, onRemove, onChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: index.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '16px',
  };

  return (
    <Paper ref={setNodeRef} style={style} {...attributes} {...listeners} sx={{ padding: 2 }}>
      <TextField
        fullWidth
        label="Título"
        value={section.title}
        onChange={(e) => onChange(index, 'title', e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        fullWidth
        label="Conteúdo"
        multiline
        rows={4}
        value={section.content}
        onChange={(e) => onChange(index, 'content', e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={section.required}
            onChange={(e) => onChange(index, 'required', e.target.checked)}
          />
        }
        label="Obrigatório"
      />
      <IconButton onClick={() => onRemove(index)} color="error" sx={{ float: 'right' }}>
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
}



  export default function EditTerms() {
    const { authData } = useAuth();
    const [termsList, setTermsList] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [version, setVersion] = useState("");
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [existingVersions, setExistingVersions] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // "error" | "success" | "info" | "warning"
    const showSnackbar = (message, severity = "error") => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);  
    };


    const sensors = useSensors(useSensor(PointerSensor));
    
    const fetchTermsAndVersions = async () => {
      try {
        const res = await axios.get("http://localhost:3000/terms", {
          headers: { Authorization: `Bearer ${authData.token}` },
        });

    const terms = res.data.terms;
    setTermsList(terms);

    const versions = terms.map(term => term.version);
    setExistingVersions(versions);

    const sorted = [...versions]
      .map(v => v.split('.').map(Number))
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    const [major, minor] = sorted.at(-1) ?? [1, 0];
        setVersion(`${major}.${minor + 1}`);
      } catch (err) {
        console.error("Erro ao buscar termos:", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (authData?.token) fetchTermsAndVersions();
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

    const handleDragEnd = ({ active, over }) => {
      if (!over) return;

      const oldIndex = parseInt(active.id);
      const newIndex = parseInt(over.id);

      if (oldIndex !== newIndex) {
        setSections((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d+\.\d+$/.test(version)) {
      showSnackbar("A versão deve estar no formato x.y (ex: 1.2)");
      return;
    }


    const versionTrimmed = version.trim();

    const isDuplicate = termsList.some(term => {
      const sameVersion = term.version.trim() === versionTrimmed;
      const differentTerm = !selectedTerm || term._id !== selectedTerm._id;
      return sameVersion && differentTerm;
    });

    if (isDuplicate) {
      showSnackbar(`A versão ${versionTrimmed} já existe. Por favor, escolha uma versão diferente.`);
      return;
    }

    try {
      if (selectedTerm) {
        // Atualizar termo existente
        await axios.put(
          `http://localhost:3000/terms/${selectedTerm._id}`,
          { version, sections },
          { headers: { Authorization: `Bearer ${authData.token}` } }
        );
        showSnackbar("Termo atualizado com sucesso!", "success");
      } else {
        // Criar novo termo
        await axios.post(
          "http://localhost:3000/terms",
          { version, sections },
          { headers: { Authorization: `Bearer ${authData.token}` } }
        );
        showSnackbar("Novo termo criado com sucesso!", "success");
      }

      handleCancelEdit();
      fetchTermsAndVersions();
    } catch (err) {
      console.error("Erro ao salvar termo:", err);
      showSnackbar("Erro ao salvar o termo. Tente novamente.", "error");
    }
  };

    if (loading) return <Loading />;

  return (
    <Box sx={{ padding: 4 }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

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

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
              {sections.map((section, index) => (
                <SortableSection
                  key={index}
                  index={index}
                  section={section}
                  onRemove={handleRemoveSection}
                  onChange={handleSectionChange}
                />
              ))}
            </SortableContext>
          </DndContext>

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
        {[...(termsList || [])].reverse().map((term) => (
          <ListItem key={term._id}>
            <Paper
              sx={{
                padding: 2,
                width: "100%",
                backgroundColor: term.active ? "#e3f2fd" : "#f5f5f5",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1">
                  Versão: {term.version} {term.active ? "(Ativo)" : "(Inativo)"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Atualizado em: {new Date(term.updatedAt || term.createdAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
                <IconButton onClick={() => handleEdit(term)} color="primary">
                  <EditIcon />
                </IconButton>
              </Box>

              {term.sections?.map((sec, idx) => (
                <Box key={idx} sx={{ marginTop: 1 }}>
                  <Typography variant="subtitle2">
                    {sec.title} {sec.required ? "(Obrigatório)" : "(Opcional)"}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
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