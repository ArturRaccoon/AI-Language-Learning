/**
 * FILE: src/pages/StudySession.jsx
 * LAST MODIFIED: 2025-11-16
 * DESCRIPTION: Study session page - loads flashcards due for review and records SM-2 reviews
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '../contexts/AuthContextDefinition';
import { getFlashcardsForReview, recordReview } from '../services/flashcardService';
import FlashcardReview from '../components/FlashcardReview';
import '../pages/StudySession.css';

function StudySession() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuthentication();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studiedCount, setStudiedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalCards = cards.length;
  const currentCard = totalCards > 0 && currentIndex < totalCards ? cards[currentIndex] : null;

  const progressPercent = useMemo(() => {
    if (totalCards === 0) return 0;
    return Math.min(100, Math.round(((studiedCount) / totalCards) * 100));
  }, [studiedCount, totalCards]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const loadCards = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      const result = await getFlashcardsForReview(currentUser.uid);

      if (result.success) {
        setCards(result.data || []);
        setCurrentIndex(0);
        setStudiedCount(0);
      } else {
        setError(result.error || 'Failed to load flashcards for review');
      }
    } catch (err) {
      console.error('Error loading study session cards:', err);
      setError(err.message || 'Failed to load flashcards for review');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/home');
  };

  const handleInterrupt = () => {
    navigate('/home');
  };

  const handleEvaluation = async (cardId, quality) => {
    if (!cardId || quality == null) return;

    try {
      setSubmitting(true);
      const result = await recordReview(cardId, quality);

      if (!result.success) {
        console.error('Error recording review:', result.error);
      }

      setStudiedCount((prev) => prev + 1);
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error('Unexpected error recording review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isCompleted = !loading && totalCards > 0 && currentIndex >= totalCards;
  const noCardsToday = !loading && totalCards === 0;

  return (
    <div className="sessione-studio-container">
      <header className="sessione-studio-header">
        <h1>{t('study_session.title', ' Study Session')}</h1>
        <button onClick={handleBackToDashboard} className="btn-back">
          {t('study_session.completed.back_to_dashboard', 'Back to Dashboard')}
        </button>
      </header>

      <main className="sessione-studio-main">
        {/* Progress */}
        <section className="progress-container">
          <div className="progress-info">
            <span className="progress-label">
              {t('study_session.progress', 'Progress')}
            </span>
            <span className="progress-count">
              {totalCards > 0
                ? t('study_session.progress_count', {
                    current: Math.min(studiedCount + 1, totalCards),
                    total: totalCards,
                  })
                : '0 / 0'}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="caricamento">
            <div className="spinner" />
            <p>{t('study_session.loading', 'Loading flashcards...')}</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="alert-errore-grande">
            <p>{error}</p>
            <button className="btn-riprova" onClick={loadCards}>
              {t('common.next', 'Retry')}
            </button>
          </div>
        )}

        {/* No cards */}
        {noCardsToday && !error && (
          <section className="sessione-completata">
            <div className="completata-icon"></div>
            <h2>{t('study_session.completed.title', 'Session Completed!')}</h2>
            <p
              className="completata-stats"
              dangerouslySetInnerHTML={{
                __html: t(
                  'study_session.completed.no_cards',
                  'No flashcards to review today.<br />Great job! ',
                ),
              }}
            />
            <div className="completata-actions">
              <button className="btn-dashboard" onClick={handleBackToDashboard}>
                {t('study_session.completed.back_to_dashboard', 'Back to Dashboard')}
              </button>
            </div>
            <div className="completata-motivazione">
              <p>{t('study_session.completed.motivation', ' Consistency is the key to success!')}</p>
              <p>{t('study_session.completed.come_back', 'Come back tomorrow to continue your learning journey.')}</p>
            </div>
          </section>
        )}

        {/* Completed session with cards */}
        {isCompleted && !error && !noCardsToday && (
          <section className="sessione-completata">
            <div className="completata-icon"></div>
            <h2>{t('study_session.completed.title', 'Session Completed!')}</h2>
            <p
              className="completata-stats"
              dangerouslySetInnerHTML={{
                __html: t('study_session.completed.studied', {
                  count: studiedCount,
                  defaultValue: 'You studied <strong>{{count}}</strong> flashcard',
                }),
              }}
            />
            <div className="completata-actions">
              <button className="btn-dashboard" onClick={handleBackToDashboard}>
                {t('study_session.completed.back_to_dashboard', 'Back to Dashboard')}
              </button>
            </div>
            <div className="completata-motivazione">
              <p>{t('study_session.completed.motivation', ' Consistency is the key to success!')}</p>
              <p>{t('study_session.completed.come_back', 'Come back tomorrow to continue your learning journey.')}</p>
            </div>
          </section>
        )}

        {/* Active card */}
        {!loading && !error && currentCard && !isCompleted && (
          <section>
            <FlashcardReview
              card={{
                id: currentCard.id,
                originalWord: currentCard.originalWord,
                translation: currentCard.translation,
                originalLanguage: currentCard.originalLanguage,
                translationLanguage: currentCard.translationLanguage,
                notes: currentCard.notes,
                category: currentCard.category,
                knowledgeLevel: currentCard.knowledgeLevel,
                reviewCount: currentCard.reviewCount,
              }}
              onEvaluate={handleEvaluation}
              disabled={submitting}
            />

            <div className="azioni-sessione">
              <button className="btn-interrompi" onClick={handleInterrupt}>
                {t('study_session.interrupt', 'Interrupt Session')}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default StudySession;
