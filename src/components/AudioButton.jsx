// src/components/AudioButton.jsx
import { useState, useEffect } from 'react';
import { leggiTesto, fermaTTS, isTTSInRiproduzione } from '../services/ttsService';
import './AudioButton.css';

/**
 * Componente pulsante audio riutilizzabile
 * Legge testo con TTS e mostra stato visivo
 */
function AudioButton({ 
  testo, 
  lingua = 'en-US', 
  size = 'medium',
  variant = 'default',
  onStart,
  onEnd,
  onError
}) {
  const [inRiproduzione, setInRiproduzione] = useState(false);
  const [errore, setErrore] = useState(false);

  // Pulisci quando il componente si smonta
  useEffect(() => {
    return () => {
      if (inRiproduzione) {
        fermaTTS();
      }
    };
  }, [inRiproduzione]);

  /**
   * Gestisce il click sul pulsante
   */
  async function handleClick(e) {
    e.stopPropagation(); // Previene propagazione evento (es. flip card)

    // Se già in riproduzione, ferma
    if (inRiproduzione || isTTSInRiproduzione()) {
      fermaTTS();
      setInRiproduzione(false);
      return;
    }

    // Valida testo
    if (!testo || testo.trim().length === 0) {
      console.warn(' Nessun testo da leggere');
      setErrore(true);
      setTimeout(() => setErrore(false), 2000);
      return;
    }

    // Avvia riproduzione
    try {
      setInRiproduzione(true);
      setErrore(false);
      
      if (onStart) onStart();

      await leggiTesto(testo, lingua);

      setInRiproduzione(false);
      if (onEnd) onEnd();

    } catch (err) {
      console.error('Errore riproduzione audio:', err);
      setInRiproduzione(false);
      setErrore(true);
      
      if (onError) onError(err);

      // Reset errore dopo 2 secondi
      setTimeout(() => setErrore(false), 2000);
    }
  }

  // Classi CSS dinamiche
  const classi = [
    'audio-button',
    `audio-button-${size}`,
    `audio-button-${variant}`,
    inRiproduzione && 'audio-button-playing',
    errore && 'audio-button-error'
  ].filter(Boolean).join(' ');

  // Icona dinamica
  const getIcona = () => {
    if (errore) return 'ERR';
    if (inRiproduzione) return 'STOP';
    return 'PLAY';
  };

  // Tooltip dinamico
  const getTooltip = () => {
    if (errore) return 'TTS non disponibile';
    if (inRiproduzione) return 'Clicca per fermare';
    return `Ascolta: "${testo.substring(0, 30)}${testo.length > 30 ? '...' : ''}"`;
  };

  return (
    <button
      className={classi}
      onClick={handleClick}
      title={getTooltip()}
      aria-label={inRiproduzione ? 'Ferma audio' : 'Riproduci audio'}
      disabled={errore && !inRiproduzione}
    >
      <span className="audio-button-icon">
        {getIcona()}
      </span>
      {inRiproduzione && (
        <span className="audio-button-wave">
          <span></span>
          <span></span>
          <span></span>
        </span>
      )}
    </button>
  );
}

export default AudioButton;