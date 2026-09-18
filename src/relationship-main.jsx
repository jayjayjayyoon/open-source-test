import React from 'react';
import { createRoot } from 'react-dom/client';
import '@xyflow/react/dist/style.css';
import RelationshipLab from './RelationshipLab.jsx';
import './relationship-lab.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><RelationshipLab /></React.StrictMode>,
);
