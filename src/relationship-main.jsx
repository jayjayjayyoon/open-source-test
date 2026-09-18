import React from 'react';
import { createRoot } from 'react-dom/client';
import '@xyflow/react/dist/style.css';
import RelationshipLabSized from './RelationshipLabSized.jsx';
import './relationship-lab.css';
import './importance.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><RelationshipLabSized /></React.StrictMode>,
);
