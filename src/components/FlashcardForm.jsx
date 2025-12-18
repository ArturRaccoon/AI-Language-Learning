/**
 * FILE: src/components/FlashcardForm.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Form for creating/editing flashcards with auto-translation
 * STYLES: Tailwind CSS (Dark Glass Theme)
 */

import { useState } from 'react';

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
        console.log(' Auto-translation successful');
      } else {
        setError('Translation failed. Please enter manually.');
      }
    } catch (err) {
      console.error(' Translation error:', err);
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
      console.error(' Form submission error:', err);
      setError('Failed to save flashcard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Flashcard' : 'New Flashcard'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center gap-2">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="originalWord" className="block text-sm font-medium text-slate-300 mb-2">
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
            className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-y min-h-[80px]"
          />
        </div>

        <div>
          <label htmlFor="translation" className="block text-sm font-medium text-slate-300 mb-2">
            Translation *
          </label>
          <div className="flex flex-col gap-2">
            <textarea
              id="translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="Enter translation"
              rows={2}
              disabled={loading}
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-y min-h-[80px]"
            />
            {onTranslate && (
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={loading || translating || !originalWord.trim()}
                className="self-end px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {translating ? 'Translating...' : 'Auto-translate'}
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
            Category (optional)
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., travel, work, daily"
            disabled={loading}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add context, examples, or usage notes"
            rows={3}
            disabled={loading}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-y min-h-[100px]"
          />
        </div>

        <div className="flex gap-4 mt-4 pt-4 border-t border-slate-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2 rounded-lg shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                {isEditing ? 'Update Card' : 'Save Card'}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default FlashcardForm;
