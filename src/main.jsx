import React from 'react';
import { createRoot } from 'react-dom/client';
import '@xyflow/react/dist/style.css';
import ControlTowerShell from './ControlTowerShell.jsx';
import './styles.css';
import './graph.css';
import './control-tower-shell.css';
import './today-dashboard.css';
import './today-task-actions.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ControlTowerShell />
  </React.StrictMode>,
);
