import React from 'react';
import { createRoot } from 'react-dom/client';
import '@xyflow/react/dist/style.css';
import ScaleLab from './ScaleLab.jsx';
import './scale-lab.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><ScaleLab /></React.StrictMode>,
);
