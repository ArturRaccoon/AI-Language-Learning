/**
 * FILE: src/pages/Flashcards.jsx
 * LAST MODIFIED: 2025-11-16
 * DESCRIPTION: Flashcard management page - create, view, edit, delete cards
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '../contexts/AuthContextDefinition';
import {
  createFlashcard,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard
} from '../services/flashcardService';
import { translateText } from '../services/translationService';
import Flashcard from '../components/Flashcard';
import CreateFlashcardModal from '../components/Flashcards/CreateFlashcardModal';
import '../styles/Flashcards.css';

function Flashcards() {
  const { t } = useTranslation();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [filter, setFilter] = useState('all'); // all, new, review, mastered
  const [searchTerm, setSearchTerm] = useState('');

  const { currentUser, userProfile } = useAuthentication();
  const navigate = useNavigate();

  useEffect(() => {
    loadFlashcards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadFlashcards = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const result = await getFlashcards(currentUser.uid);

      if (result.success) {
        setFlashcards(result.data);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (cardData) => {
    try {
      const result = await createFlashcard(currentUser.uid, {
        ...cardData,
        originalLanguage: userProfile?.targetLanguage || 'en',
        translationLanguage: userProfile?.nativeLanguage || 'it'
      });

      if (result.success) {
        setFlashcards([result.data, ...flashcards]);
        setShowForm(false);
        console.log(' Flashcard created successfully');
      }
    } catch (error) {
      console.error('Error creating flashcard:', error);
    }
  };

  const handleUpdateCard = async (cardId, newData) => {
    try {
      const result = await updateFlashcard(cardId, newData);

      if (result.success) {
        setFlashcards(flashcards.map(card =>
          card.id === cardId ? { ...card, ...newData } : card
        ));
        setEditingCard(null);
        console.log(' Flashcard updated successfully');
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm(t('flashcards.delete_confirm', 'Are you sure you want to delete this flashcard?'))) {
      return;
    }

    try {
      const result = await deleteFlashcard(cardId);

      if (result.success) {
        setFlashcards(flashcards.filter(card => card.id !== cardId));
        console.log(' Flashcard deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const handleQuickTranslate = async (text) => {
    try {
      const result = await translateText(
        text,
        userProfile?.targetLanguage || 'en',
        userProfile?.nativeLanguage || 'it'
      );

      if (result.success) {
        return result.translation;
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
    return '';
  };

  // Filter flashcards
  const filteredFlashcards = flashcards.filter(card => {
    // Apply search filter
    const matchesSearch = searchTerm === '' ||
      card.originalWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.translation.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Apply category filter
    switch (filter) {
      case 'new':
        return card.reviewCount === 0;
      case 'review':
        return card.reviewCount > 0 && card.knowledgeLevel < 4;
      case 'mastered':
        return card.knowledgeLevel >= 4;
      default:
        return true;
    }
  });

  const newCount = flashcards.filter(c => c.reviewCount === 0).length;
  const reviewCount = flashcards.filter(c => c.reviewCount > 0 && c.knowledgeLevel < 4).length;
  const masteredCount = flashcards.filter(c => c.knowledgeLevel >= 4).length;

  return (
    <div className="flashcards-container">
      {/* Header */}
      <header className="flashcards-header">
        <div className="header-content">
          <h1>{t('flashcards.title', ' My Flashcards')}</h1>
          <p>{t('flashcards.total_cards', '{{count}} total cards', { count: flashcards.length })}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          {t('flashcards.new_card', ' New Card')}
        </button>
      </header>

      {/* Filters */}
      <div className="flashcards-filters">
        <div className="search-bar">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder={t('flashcards.search_placeholder', 'Search flashcards...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('flashcards.filters.all', ' All ({{count}})', { count: flashcards.length })}
          </button>
          <button
            className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            {t('flashcards.filters.new', ' New ({{count}})', { count: newCount })}
          </button>
          <button
            className={`filter-btn ${filter === 'review' ? 'active' : ''}`}
            onClick={() => setFilter('review')}
          >
            {t('flashcards.filters.review', ' Review ({{count}})', { count: reviewCount })}
          </button>
          <button
            className={`filter-btn ${filter === 'mastered' ? 'active' : ''}`}
            onClick={() => setFilter('mastered')}
          >
            {t('flashcards.filters.mastered', ' Mastered ({{count}})', { count: masteredCount })}
          </button>
        </div>
      </div>

      {/* Flashcard Form Modal */}
      <CreateFlashcardModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateCard}
        onTranslate={handleQuickTranslate}
      />

      {/* Edit Form Modal */}
      <CreateFlashcardModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSubmit={(data) => handleUpdateCard(editingCard.id, data)}
        onTranslate={handleQuickTranslate}
        initialData={editingCard}
        isEditing={true}
      />

      {/* Flashcard Grid */}
      <div className="flashcards-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('flashcards.loading', 'Loading flashcards...')}</p>
          </div>
        ) : filteredFlashcards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h2>
              {searchTerm || filter !== 'all'
                ? t('flashcards.empty.no_match', 'No flashcards match your filters')
                : t('flashcards.empty.no_cards', 'No flashcards yet')}
            </h2>
            <p>
              {searchTerm || filter !== 'all'
                ? t('flashcards.empty.adjust_filters', 'Try adjusting your search or filters')
                : t('flashcards.empty.create_first', 'Create your first flashcard to start learning!')}
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                {t('flashcards.empty.create_button', ' Create First Card')}
              </button>
            )}
          </div>
        ) : (
          <div className="flashcard-grid">
            {filteredFlashcards.map(card => (
              <Flashcard
                key={card.id}
                flashcard={card}
                onEdit={() => setEditingCard(card)}
                onDelete={() => handleDeleteCard(card.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button onClick={() => navigate('/home')} className="nav-item">
          <span></span>
          <span>{t('nav.home', 'Home')}</span>
        </button>
        <button onClick={() => navigate('/flashcards')} className="nav-item active">
          <span></span>
          <span>{t('nav.cards', 'Cards')}</span>
        </button>
        <button onClick={() => navigate('/study')} className="nav-item">
          <span></span>
          <span>{t('nav.study', 'Study')}</span>
        </button>
        <button onClick={() => navigate('/statistics')} className="nav-item">
          <span></span>
          <span>{t('nav.stats', 'Stats')}</span>
        </button>
        <button onClick={() => navigate('/settings')} className="nav-item">
          <span></span>
          <span>{t('nav.settings', 'Settings')}</span>
        </button>
      </nav>
    </div>
  );
}

export default Flashcards;
