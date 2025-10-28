/**
 * FILE: src/components/Flashcard.jsx
 * DATA ULTIMA MODIFICA: 2024-12-25 21:55
 * DESCRIZIONE: Componente flashcard con:
 *   - Flip animation 3D
 *   - Audio TTS con voci casuali per lingua
 *   - Eliminazione con conferma
 *   - Fallback per card vecchie senza lingua
 */

import { useState } from 'react';
import AudioButton from './AudioButton';
import './Flashcard.css';

function Flashcard({ card, onElimina }) {
  const [girato, setGirato] = useState(false);

  const handleFlip = () => {
    setGirato(!girato);
  };

  const handleElimina = (e) => {
    e.stopPropagation();
    if (window.confirm('Sei sicuro di voler eliminare questa flashcard?')) {
      onElimina(card.id);
    }
  };

  // Fallback per card vecchie senza lingua salvata
  const linguaFronte = card.linguaOriginale || 'en-US';
  const linguaRetro = card.linguaTraduzione || 'it-IT';

  return (
    <div className="flashcard-wrapper" onClick={handleFlip}>
      <div className={`flashcard-inner ${girato ? 'flipped' : ''}`}>
        {/* FRONTE */}
        <div className="flashcard-face flashcard-front">
          <button 
            onClick={handleElimina} 
            className="btn-elimina" 
            aria-label="Elimina flashcard"
          >
            ✕
          </button>
          
          {/* Audio con lingua dinamica */}
          <div className="audio-container">
            <AudioButton 
              testo={card.parolaOriginale}
              lingua={linguaFronte}
              size="medium"
            />
          </div>
          
          <div className="flashcard-content">
            <p className="testo-lingua">Parola Originale</p>
            <p className="testo-principale">{card.parolaOriginale}</p>
          </div>
          <div className="flip-hint">Clicca per girare</div>
        </div>

        {/* RETRO */}
        <div className="flashcard-face flashcard-back">
          <button 
            onClick={handleElimina} 
            className="btn-elimina" 
            aria-label="Elimina flashcard"
          >
            ✕
          </button>
          
          {/* Audio con lingua dinamica */}
          <div className="audio-container">
            <AudioButton 
              testo={card.traduzione}
              lingua={linguaRetro}
              size="medium"
            />
          </div>
          
          <div className="flashcard-content">
            <p className="testo-lingua">Traduzione</p>
            <p className="testo-principale">{card.traduzione}</p>
          </div>
          <div className="flip-hint">Clicca per girare</div>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;