/**
 * FILE: src/pages/Home.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Main dashboard with study statistics and quick actions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { getStatistics } from '../services/flashcardService';
import '../styles/Home.css';

function Home() {
  const { currentUser, userProfile, logout } = useAuthentication();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStatistics();
  }, [currentUser]);

  const loadStatistics = async () => {
    if (!currentUser) return;

    try {
      const result = await getStatistics(currentUser.uid);
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>👋 Welcome back, {userProfile?.name || 'Student'}!</h1>
          <p>
            Learning {userProfile?.targetLanguage?.toUpperCase() || 'NEW LANGUAGE'} • 
            Level {userProfile?.level || 'A1'}
          </p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          🚪 Logout
        </button>
      </header>

      <div className="dashboard-grid">
        {/* Statistics Cards */}
        <div className="stats-section">
          <h2>📊 Your Progress</h2>
          
          {loading ? (
            <div className="loading-stats">Loading statistics...</div>
          ) : statistics ? (
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <h3>{statistics.total}</h3>
                  <p>Total Flashcards</p>
                </div>
              </div>

              <div className="stat-card highlight">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>{statistics.dueForReview}</h3>
                  <p>Due for Review</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✨</div>
                <div className="stat-content">
                  <h3>{statistics.new}</h3>
                  <p>New Cards</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <h3>{statistics.mastered}</h3>
                  <p>Mastered</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-stats">No statistics available yet</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="actions-section">
          <h2>🚀 Quick Actions</h2>
          
          <div className="action-cards">
            <button 
              className="action-card primary"
              onClick={() => navigate('/study')}
              disabled={!statistics || statistics.dueForReview === 0}
            >
              <div className="action-icon">📖</div>
              <h3>Study Session</h3>
              <p>
                {statistics?.dueForReview > 0 
                  ? `${statistics.dueForReview} cards waiting`
                  : 'No cards due today'}
              </p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/flashcards')}
            >
              <div className="action-icon">➕</div>
              <h3>Create Flashcard</h3>
              <p>Add new words to learn</p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/review')}
            >
              <div className="action-icon">🔄</div>
              <h3>Review All</h3>
              <p>Browse all flashcards</p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/statistics')}
            >
              <div className="action-icon">📈</div>
              <h3>Statistics</h3>
              <p>View detailed progress</p>
            </button>
          </div>
        </div>

        {/* Level Distribution */}
        {statistics && (
          <div className="level-section">
            <h2>⭐ Knowledge Levels</h2>
            <div className="level-bars">
              {[1, 2, 3, 4, 5].map(level => {
                const count = statistics.byLevel[`level${level}`] || 0;
                const percentage = statistics.total > 0 
                  ? (count / statistics.total) * 100 
                  : 0;

                return (
                  <div key={level} className="level-bar">
                    <div className="level-info">
                      <span>Level {level}</span>
                      <span>{count} cards</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill level-${level}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <nav className="home-nav">
        <button onClick={() => navigate('/home')} className="nav-item active">
          <span>🏠</span>
          <span>Home</span>
        </button>
        <button onClick={() => navigate('/flashcards')} className="nav-item">
          <span>📇</span>
          <span>Cards</span>
        </button>
        <button onClick={() => navigate('/study')} className="nav-item">
          <span>📖</span>
          <span>Study</span>
        </button>
        <button onClick={() => navigate('/statistics')} className="nav-item">
          <span>📊</span>
          <span>Stats</span>
        </button>
        <button onClick={() => navigate('/settings')} className="nav-item">
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default Home;