/**
 * FILE: src/components/FlashcardReview.jsx
 * LAST MODIFIED: 2025-11-16
 * DESCRIPTION: Single flashcard review component with SRS evaluation (SM-2) and i18n
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AudioButton from './AudioButton';
import './FlashcardReview.css';

/**
 * Props:
 * - card: {
 *     id: string,
 *     originalWord: string,
 *     translation: string,
 *     originalLanguage?: string,
 *     translationLanguage?: string,
 *     notes?: string,
 *     category?: string,
 *     knowledgeLevel?: number,
 *     reviewCount?: number,
 *   }
 * - onEvaluate: (cardId: string, quality: 0|1|2|3|4|5) => void
 * - disabled?: boolean
 */
function FlashcardReview({ card, onEvaluate, disabled = false }) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    if (!flipped) {
      console.log('🔄 Card flipped:', card.originalWord);
      setFlipped(true);
    }
  };

  const handleEvaluation = (quality) => {
    if (disabled) return;
    console.log('⭐ Evaluation:', quality, 'for card:', card.id);
    if (onEvaluate) {
      onEvaluate(card.id, quality);
      setFlipped(false);
    }
  };

  const originalLanguage = card.originalLanguage || 'en-US';
  const translationLanguage = card.translationLanguage || 'it-IT';

  const knowledgeLevel = card.knowledgeLevel || 1;
  const reviewCount = card.reviewCount || 0;
  const category = card.category || 'general';

  return (
    <div className="flashcard-revisione-container">
      {/* MAIN CARD */}
      <div
        className={`flashcard-revisione ${flipped ? 'girata' : ''}`}
        onClick={handleFlip}
      >
        <div className="flashcard-revisione-inner">
          {/* FRONT */}
          <div className="flashcard-revisione-face flashcard-revisione-front">
            <div className="audio-container-revisione">
              <AudioButton
                testo={card.originalWord}
                lingua={originalLanguage}
                size="large"
              />
            </div>

            <div className="flashcard-revisione-content">
              <p className="flashcard-revisione-label">
                {t('study_session.card_info.remember_translation', 'Do you remember the translation?')}
              </p>
              <p className="flashcard-revisione-text">{card.originalWord}</p>

              {card.notes && (
                <p className="flashcard-revisione-note">
                  💡 {card.notes}
                </p>
              )}
            </div>

            <div className="flashcard-revisione-hint">
              {t('study_session.card_info.click_to_flip', '👆 Click to see answer')}
            </div>
          </div>

          {/* BACK */}
          <div className="flashcard-revisione-face flashcard-revisione-back">
            <div className="audio-container-revisione">
              <AudioButton
                testo={card.translation}
                lingua={translationLanguage}
                size="large"
              />
            </div>

            <div className="flashcard-revisione-content">
              <p className="flashcard-revisione-label-small">
                {t('study_session.card_info.translation', 'Translation')}
              </p>
              <p className="flashcard-revisione-text">{card.translation}</p>

              <div className="flashcard-revisione-separator" />

              <p className="flashcard-revisione-label-small">
                {t('study_session.card_info.original', 'Original')}
              </p>
              <p className="flashcard-revisione-text-small">{card.originalWord}</p>
            </div>
          </div>
        </div>
      </div>

      {/* EVALUATION BUTTONS (only when flipped) */}
      {flipped && (
        <div className="valutazione-container">
          <p className="valutazione-domanda">
            {t('study_session.evaluation.question', 'How well did you remember it?')}
          </p>

          <div className="valutazione-buttons">
            <button
              type="button"
              onClick={() => handleEvaluation(0)}
              className="btn-valutazione btn-valutazione-male"
              disabled={disabled}
            >
              <span className="valutazione-emoji">😰</span>
              <span className="valutazione-label">
                {t('study_session.evaluation.forgot', 'Forgot')}
              </span>
              <span className="valutazione-descrizione">
                {t('study_session.evaluation.forgot_desc', 'Review soon')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleEvaluation(3)}
              className="btn-valutazione btn-valutazione-difficile"
              disabled={disabled}
            >
              <span className="valutazione-emoji">🤔</span>
              <span className="valutazione-label">
                {t('study_session.evaluation.hard', 'Hard')}
              </span>
              <span className="valutazione-descrizione">
                {t('study_session.evaluation.hard_desc', 'With effort')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleEvaluation(4)}
              className="btn-valutazione btn-valutazione-bene"
              disabled={disabled}
            >
              <span className="valutazione-emoji">😊</span>
              <span className="valutazione-label">
                {t('study_session.evaluation.good', 'Good')}
              </span>
              <span className="valutazione-descrizione">
                {t('study_session.evaluation.good_desc', 'No problem')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleEvaluation(5)}
              className="btn-valutazione btn-valutazione-facile"
              disabled={disabled}
            >
              <span className="valutazione-emoji">🎉</span>
              <span className="valutazione-label">
                {t('study_session.evaluation.easy', 'Easy')}
              </span>
              <span className="valutazione-descrizione">
                {t('study_session.evaluation.easy_desc', 'Perfect!')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* CARD INFO (SRS details) */}
      <div className="card-info">
        <div className="card-info-item">
          <span className="card-info-label">
            {t('study_session.card_info.level', 'Level:')}
          </span>
          <span className="card-info-value">{'⭐'.repeat(knowledgeLevel)}</span>
        </div>
        <div className="card-info-item">
          <span className="card-info-label">
            {t('study_session.card_info.reviews', 'Reviews:')}
          </span>
          <span className="card-info-value">{reviewCount}</span>
        </div>
        {category && category !== 'general' && (
          <div className="card-info-item">
            <span className="card-info-label">
              {t('study_session.card_info.category', 'Category:')}
            </span>
            <span className="card-info-value">{category}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlashcardReview;
