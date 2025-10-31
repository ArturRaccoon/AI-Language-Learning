/**
 * FILE: src/components/FlashcardRevisione.jsx
 * DATA CREAZIONE: 2024-12-26 00:20
 * DESCRIZIONE: Componente per revisione singola flashcard con valutazione SRS
 */

import { useState } from 'react';
import AudioButton from './AudioButton';
import './FlashcardRevisione.css';

function FlashcardRevisione({ card, onValutazione }) {
  const [girato, setGirato] = useState(false);

  function handleFlip() {
    if (!girato) {
      console.log('🔄 Card girata:', card.parolaOriginale);
      setGirato(true);
    }
  }

  function handleValutazione(qualita) {
    console.log('⭐ Valutazione:', qualita, 'per card:', card.id);
    onValutazione(card.id, qualita);
  }

  // Ottieni lingue per TTS
  const linguaOriginale = card.linguaOriginale || 'en-US';
  const linguaTraduzione = card.linguaTraduzione || 'it-IT';

  return (
    <div className="flashcard-revisione-container">
      {/* CARD PRINCIPALE */}
      <div 
        className={`flashcard-revisione ${girato ? 'girata' : ''}`}
        onClick={handleFlip}
      >
        <div className="flashcard-revisione-inner">
          {/* FRONTE */}
          <div className="flashcard-revisione-face flashcard-revisione-front">
            <div className="audio-container-revisione">
              <AudioButton 
                testo={card.parolaOriginale}
                lingua={linguaOriginale}
                size="large"
              />
            </div>
            
            <div className="flashcard-revisione-content">
              <p className="flashcard-revisione-label">Ricordi la traduzione?</p>
              <p className="flashcard-revisione-text">{card.parolaOriginale}</p>
              
              {card.note && (
                <p className="flashcard-revisione-note">
                  💡 {card.note}
                </p>
              )}
            </div>
            
            <div className="flashcard-revisione-hint">
              👆 Clicca per vedere la risposta
            </div>
          </div>

          {/* RETRO */}
          <div className="flashcard-revisione-face flashcard-revisione-back">
            <div className="audio-container-revisione">
              <AudioButton 
                testo={card.traduzione}
                lingua={linguaTraduzione}
                size="large"
              />
            </div>
            
            <div className="flashcard-revisione-content">
              <p className="flashcard-revisione-label-small">Traduzione</p>
              <p className="flashcard-revisione-text">{card.traduzione}</p>
              
              <div className="flashcard-revisione-separator"></div>
              
              <p className="flashcard-revisione-label-small">Originale</p>
              <p className="flashcard-revisione-text-small">{card.parolaOriginale}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PULSANTI VALUTAZIONE (solo se girato) */}
      {girato && (
        <div className="valutazione-container">
          <p className="valutazione-domanda">Quanto bene l'hai ricordata?</p>
          
          <div className="valutazione-buttons">
            <button 
              onClick={() => handleValutazione(0)}
              className="btn-valutazione btn-valutazione-male"
            >
              <span className="valutazione-emoji">😰</span>
              <span className="valutazione-label">Non ricordo</span>
              <span className="valutazione-descrizione">Rivedila presto</span>
            </button>
            
            <button 
              onClick={() => handleValutazione(3)}
              className="btn-valutazione btn-valutazione-difficile"
            >
              <span className="valutazione-emoji">🤔</span>
              <span className="valutazione-label">Difficile</span>
              <span className="valutazione-descrizione">Con sforzo</span>
            </button>
            
            <button 
              onClick={() => handleValutazione(4)}
              className="btn-valutazione btn-valutazione-bene"
            >
              <span className="valutazione-emoji">😊</span>
              <span className="valutazione-label">Bene</span>
              <span className="valutazione-descrizione">Senza problemi</span>
            </button>
            
            <button 
              onClick={() => handleValutazione(5)}
              className="btn-valutazione btn-valutazione-facile"
            >
              <span className="valutazione-emoji">🎉</span>
              <span className="valutazione-label">Facile</span>
              <span className="valutazione-descrizione">Perfetto!</span>
            </button>
          </div>
        </div>
      )}

      {/* INFO CARD (dettagli SRS) */}
      <div className="card-info">
        <div className="card-info-item">
          <span className="card-info-label">Livello:</span>
          <span className="card-info-value">
            {'⭐'.repeat(card.livelloConoscenza || 1)}
          </span>
        </div>
        <div className="card-info-item">
          <span className="card-info-label">Revisioni:</span>
          <span className="card-info-value">{card.numeroRevisioni || 0}</span>
        </div>
        {card.categoria && card.categoria !== 'generale' && (
          <div className="card-info-item">
            <span className="card-info-label">Categoria:</span>
            <span className="card-info-value">{card.categoria}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlashcardRevisione;