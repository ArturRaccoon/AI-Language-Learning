// src/components/Flashcard.jsx
import { useState } from 'react';
import './Flashcard.css';

/**
 * Componente Flashcard con flip animation 3D
 * @param {Object} card - Dati della flashcard (parolaOriginale, traduzione)
 * @param {Function} onElimina - Callback per eliminare la card
 */
function Flashcard({ card, onElimina }) {
  const [girato, setGirato] = useState(false);

  const handleFlip = () => {
    setGirato(!girato);
  };

  const handleElimina = (e) => {
    e.stopPropagation(); // Previene il flip quando si clicca su elimina
    if (window.confirm('Sei sicuro di voler eliminare questa flashcard?')) {
      onElimina(card.id);
    }
  };

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