import React from 'react';
import styles from './loading.module.css';
import { CircularProgress, Typography, Box } from "@mui/material";
// import RestaurantIcon from '@mui/icons-material/Restaurant';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';

export default function Loading() {
  return (
    <Box
      className={styles.loadingContainer}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#001f1f"
      color="#faf0ca"
      role="status"
      aria-label="Loading"
    >

      {/* <RestaurantIcon style={{ fontSize: 80, marginBottom: 16 }} /> */}
      <SoupKitchenIcon style={{ fontSize: 80, marginBottom: 16 }} />
      <Typography variant="h5" gutterBottom>
        Preparando seu prato...
      </Typography>
      <CircularProgress style={{ color: "#faf0ca" }} />
    </Box>
  );
}

