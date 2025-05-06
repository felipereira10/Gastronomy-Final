import React from 'react';
import '../loading/loading.module.css';

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}
