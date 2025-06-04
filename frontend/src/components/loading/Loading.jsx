import React from 'react';
import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.loadingContainer} role="status" aria-label="Loading">
      <div className={styles.spinner}></div>
      <p>Loading...</p>
    </div>
  );
}
