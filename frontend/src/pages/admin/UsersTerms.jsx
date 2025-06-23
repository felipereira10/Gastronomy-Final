import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, List, ListItem } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading.jsx";

export default function UsersTerms() {
  const { authData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users/admin/users-terms", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
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

  if (loading) return <Loading />;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Usuários e Aceite de Termos
      </Typography>
      <List>
        {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
                <ListItem key={user._id || user.email}>
                <Paper sx={{ padding: 2, width: "100%" }}>
                    <Typography variant="h6"><strong>Nome:</strong> {user.fullname}</Typography>
                    <Typography><strong>Email:</strong> {user.email}</Typography>
                    <Typography><strong>Função:</strong> {user.role}</Typography>
                    <Typography>
                    <strong>Nascimento:</strong>{" "}
                    {user.birthdate ? new Date(user.birthdate).toLocaleDateString() : "Não informado"}
                    </Typography>
                    <Typography>
                    <strong>Aceitou termos?</strong>{" "}
                    {user.acceptedTerms?.version || "Não"}
                    </Typography>
                    {user.acceptedTerms?.at && (
                    <><Typography>
                      <strong>Data do aceite:</strong>{" "}
                      {new Date(user.acceptedTerms.at).toLocaleString()}
                    </Typography><Typography>
                        <strong>Aceitou termos?</strong>{" "}
                        {user.acceptedTerms?.version ? (
                          <span style={{ color: "green" }}>Sim - v{user.acceptedTerms.version}</span>
                        ) : (
                          <span style={{ color: "red" }}>Não</span>
                        )}
                      </Typography></>
                    )}
                </Paper>
                </ListItem>
            ))
            ) : (
            <Typography>Nenhum usuário encontrado.</Typography>
            )}
      </List>
    </Box>
  );
}
