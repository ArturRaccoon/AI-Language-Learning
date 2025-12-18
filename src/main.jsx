/**
 * FILE: src/main.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Application entry point with i18n support and Suspense for translations loading
 */

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import LoadingFallback from './components/LoadingFallback';

// Import i18n configuration
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Suspense wrapper to handle async translations loading */}
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
