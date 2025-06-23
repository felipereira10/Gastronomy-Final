import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from "@mui/material";

export default function TermsModal({ currentTerms, onAccept }) {
  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitle>Termos de Uso - Versão {currentTerms.version}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            maxHeight: "400px",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: 2,
            borderRadius: 1,
            backgroundColor: "#f9f9f9"
          }}
        >
          <Typography variant="body1" style={{ whiteSpace: "pre-line" }}>
            {currentTerms.content}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onAccept}
          variant="contained"
          color="primary"
        >
          Aceitar Termos
        </Button>
      </DialogActions>
    </Dialog>
  );
}