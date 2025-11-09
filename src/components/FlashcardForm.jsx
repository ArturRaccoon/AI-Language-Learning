/**
 * FILE: src/components/FlashcardForm.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Form for creating/editing flashcards with auto-translation
 */

import { useState } from 'react';
import './FlashcardForm.css';

function FlashcardForm({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  onTranslate,
  isEditing = false 
}) {
  // Form state
  const [originalWord, setOriginalWord] = useState(initialData?.originalWord || '');
  const [translation, setTranslation] = useState(initialData?.translation || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [category, setCategory] = useState(initialData?.category || '');

  // UI state
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');

  /**
   * Auto-translate original word
   */
  const handleAutoTranslate = async () => {
    if (!originalWord.trim()) {
      setError('Enter text to translate');
      return;
    }

    if (!onTranslate) {
      setError('Translation service not available');
      return;
    }

    setTranslating(true);
    setError('');

    try {
      const translatedText = await onTranslate(originalWord);
      
      if (translatedText) {
        setTranslation(translatedText);
        console.log('✅ Auto-translation successful');
      } else {
        setError('Translation failed. Please enter manually.');
      }
    } catch (err) {
      console.error('❌ Translation error:', err);
      setError('Translation error. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  /**
   * Submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!originalWord.trim()) {
      setError('Original word is required');
      return;
    }

    if (!translation.trim()) {
      setError('Translation is required');
      return;
    }

    setLoading(true);

    try {
      const flashcardData = {
        originalWord: originalWord.trim(),
        translation: translation.trim(),
        notes: notes.trim(),
        category: category.trim() || 'general'
      };

      await onSubmit(flashcardData);
      
      // Reset form if creating new card
      if (!isEditing) {
        setOriginalWord('');
        setTranslation('');
        setNotes('');
        setCategory('');
      }
    } catch (err) {
      console.error('❌ Form submission error:', err);
      setError('Failed to save flashcard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flashcard-form-container">
      <div className="form-header">
        <h2>{isEditing ? '✏️ Edit Flashcard' : '➕ New Flashcard'}</h2>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flashcard-form">
        <div className="form-group">
          <label htmlFor="originalWord">
            Original Word / Phrase *
          </label>
          <textarea
            id="originalWord"
            value={originalWord}
            onChange={(e) => setOriginalWord(e.target.value)}
            placeholder="Enter word or phrase to learn"
            rows={2}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="translation">
            Translation *
          </label>
          <div className="translation-group">
            <textarea
              id="translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="Enter translation"
              rows={2}
              disabled={loading}
              required
            />
            {onTranslate && (
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={loading || translating || !originalWord.trim()}
                className="btn-translate"
              >
                {translating ? '⏳ Translating...' : '🔄 Auto-translate'}
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">
            Category (optional)
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., travel, work, daily"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add context, examples, or usage notes"
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-cancel"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                {isEditing ? '💾 Update' : '💾 Save'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FlashcardForm;
