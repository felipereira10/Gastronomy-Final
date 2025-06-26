import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading.jsx";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export default function UsersTerms() {
  const { authData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:3000/users/admin/users-terms",
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );
      setUsers(res.data.users);
    } catch (err) {
      console.error("Erro ao buscar usuários", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/users/${userId}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      setDeleteSuccess(true); // Exibe a confirmação

      setTimeout(() => {
        setDeleteSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Erro ao excluir usuário", err);
      alert("Erro ao excluir usuário. Tente novamente.");
    }
  };

  const getStatusColor = (acceptedTerms) => {
    if (!acceptedTerms?.version) return "error"; // vermelho = não aceitou

    const sections = acceptedTerms.sections;
    if (!sections || !Array.isArray(sections)) return "warning"; // laranja = dados antigos/parciais

    const allAccepted = sections.every(
      (s) => s.required || (!s.required && s.acceptedAt)
    );

    return allAccepted ? "success" : "warning"; // verde se tudo aceito, laranja se parcial
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    const fullname = user.fullname?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const birthdateFormatted = user.birthdate
      ? new Date(user.birthdate).toLocaleDateString()
      : "";

    return (
      fullname.includes(searchLower) ||
      email.includes(searchLower) ||
      birthdateFormatted.includes(searchLower)
    );
  });

  if (loading) return <Loading />;

  return (
    <Box sx={{ padding: 4 }}>
      {/* Feedback de exclusão */}
      {deleteSuccess && (
        <div
          className="cookieOverlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffe0e0",
              padding: "2em",
              borderRadius: "1em",
              width: "90%",
              maxWidth: "500px",
              textAlign: "center",
              animation: "fadeScaleIn 0.3s ease",
            }}
          >
            <ClearIcon
              style={{ fontSize: 40, color: "red", marginBottom: "1rem" }}
            />
            <Typography variant="h6" color="error">
              Usuário excluído com sucesso!
            </Typography>
          </div>
        </div>
      )}

      <Typography variant="h4" gutterBottom>
        Usuários e Aceite de Termos
      </Typography>

      <TextField
        label="Buscar por nome, email ou nascimento"
        variant="outlined"
        size="small"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="limpar busca"
                onClick={() => setSearch("")}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      <List disablePadding>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const statusColor = getStatusColor(user.acceptedTerms);
            const borderColor =
              statusColor === "success"
                ? "green"
                : statusColor === "warning"
                ? "orange"
                : "red";

            return (
              <ListItem key={user._id} disableGutters sx={{ marginBottom: 2 }}>
                <Paper
                  elevation={4}
                  sx={{
                    padding: 3,
                    width: "100%",
                    borderLeft: `6px solid ${borderColor}`,
                    backgroundColor:
                      statusColor === "success"
                        ? "#e8f5e9"
                        : statusColor === "warning"
                        ? "#fff8e1"
                        : "#ffebee",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="h6">{user.fullname}</Typography>

                    <Typography>
                      <strong>Email:</strong> {user.email}
                    </Typography>

                    <Typography>
                      <strong>Função:</strong> {user.role}
                    </Typography>

                    <Typography>
                      <strong>Nascimento:</strong>{" "}
                      {user.birthdate
                        ? new Date(user.birthdate).toLocaleDateString()
                        : "Não informado"}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography>
                        <strong>Aceitou termos:</strong>
                      </Typography>
                      {user.acceptedTerms?.version ? (
                        <Chip
                          label={`Versão ${user.acceptedTerms.version}`}
                          color={statusColor}
                        />
                      ) : (
                        <Chip label="Não aceitou" color="error" />
                      )}
                    </Stack>

                    {user.acceptedTerms?.acceptedAt && (
                      <Typography>
                        <strong>Data do aceite:</strong>{" "}
                        {new Date(user.acceptedTerms.acceptedAt).toLocaleString()}
                      </Typography>
                    )}

                    {user.acceptedTerms?.sections?.length > 0 && (
                      <Box>
                        <Typography>
                          <strong>Detalhamento das seções:</strong>
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                          {user.acceptedTerms.sections.map((section, index) => {
                            const accepted = section.required
                              ? true
                              : Boolean(section.acceptedAt);
                            return (
                              <Chip
                                key={index}
                                label={`${section.title} ${
                                  section.required ? "(Obrigatório)" : "(Opcional)"
                                }`}
                                color={accepted ? "success" : "error"}
                                variant="outlined"
                                size="small"
                              />
                            );
                          })}
                        </Stack>
                      </Box>
                    )}

                    {!user.acceptedTerms && (
                      <Typography color="error">
                        ⚠️ Usuário criado antes da implementação dos termos.
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      sx={{ marginTop: 2, alignSelf: "flex-start" }}
                      onClick={() => setConfirmDeleteId(user._id)}
                    >
                      Excluir Usuário
                    </Button>
                  </Stack>
                </Paper>
              </ListItem>
            );
          })
        ) : (
          <Typography>Nenhum usuário encontrado.</Typography>
        )}
      </List>

      {/* Modal de confirmação fora do map */}
      {confirmDeleteId && (
        <div
          className="cookieOverlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            color: "white",
            backdropFilter: "blur(2px)",
            animation: "fadeIn 0.3s ease",
            // border: "2px solid rgba(255, 255, 255, 0.5)",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(202, 57, 57, 0.51)",
              padding: "2em",
              borderRadius: "1em",
              width: "90%",
              maxWidth: "500px",
              textAlign: "center",
              animation: "fadeScaleIn 0.3s ease",
              border: "2px solid rgb(255, 255, 255)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Tem certeza que deseja excluir este usuário?
            </Typography>

            <Stack direction="row" spacing={2} mt={3} justifyContent="center">
              <Button
                variant="contained"
                color="error"
                onClick={async () => {
                  await handleDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                Sim, excluir
              </Button>

              <Button
                variant="outlined"
                onClick={() => setConfirmDeleteId(null)}
                sx={{
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    backgroundColor: "white",
                    color: "red",
                    borderColor: "red",
                  },
                }}
              >
                Cancelar
              </Button>
            </Stack>
          </div>
        </div>
      )}
    </Box>
  );
}
