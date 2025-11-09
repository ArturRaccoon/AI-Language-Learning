/**
 * FILE: src/components/Flashcard.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Interactive flashcard component with flip animation and actions
 */

import { useState } from 'react';
import './Flashcard.css';

function Flashcard({ flashcard, onEdit, onDelete }) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  // Calculate knowledge level display
  const knowledgeLevel = flashcard.knowledgeLevel || 1;
  const reviewCount = flashcard.reviewCount || 0;

  // Format last reviewed date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={handleFlip}>
      {/* Header with level and actions */}
      <div className="flashcard-header">
        <div className="flashcard-level">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`level-dot ${level <= knowledgeLevel ? 'filled' : ''}`}
            />
          ))}
        </div>
        <div className="flashcard-actions">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="icon-btn"
              title="Edit flashcard"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="icon-btn"
              title="Delete flashcard"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Card content */}
      <div className="flashcard-content">
        <div className="flashcard-word">
          {flashcard.originalWord}
        </div>
        {!flipped && (
          <div className="flip-hint">💡 Click to reveal</div>
        )}
        {flipped && (
          <>
            <div className="flashcard-translation">
              {flashcard.translation}
            </div>
            {flashcard.notes && (
              <div className="flashcard-context">
                {flashcard.notes}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with stats */}
      <div className="flashcard-footer">
        <div className="review-count">
          🔄 {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </div>
        <div className="last-reviewed">
          {formatDate(flashcard.lastReview)}
        </div>
      </div>
    </div>
  );
}

export default Flashcard;
