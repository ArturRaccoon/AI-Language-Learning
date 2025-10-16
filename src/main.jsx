// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AutenticazioneProvider } from './contexts/AutenticazioneContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AutenticazioneProvider>
        <App />
      </AutenticazioneProvider>
    </BrowserRouter>
  </React.StrictMode>
);