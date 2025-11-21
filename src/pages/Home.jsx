/**
 * FILE: src/pages/Home.jsx
 * LAST MODIFIED: 2025-11-16
 * DESCRIPTION: Main dashboard with study statistics and quick actions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { getStatistics } from '../services/flashcardService';
import '../styles/Home.css';

function Home() {
  const { t } = useTranslation();
  const { currentUser, userProfile, logout } = useAuthentication();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <h1>
            {t('home.header.welcome', ' Welcome back, {{name}}!', {
              name: userProfile?.name || t('home.header.default_name', 'Student')
            })}
          </h1>
          <p>
            {t('home.header.learning', 'Learning {{language}} • Level {{level}}', {
              language: userProfile?.targetLanguage?.toUpperCase() || t('home.header.default_language', 'NEW LANGUAGE'),
              level: userProfile?.level || 'A1'
            })}
          </p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          {t('home.header.logout', ' Logout')}
        </button>
      </header>

      <div className="dashboard-grid">
        {/* Statistics Cards */}
        <div className="stats-section">
          <h2>{t('home.stats.title', ' Your Progress')}</h2>
          
          {loading ? (
            <div className="loading-stats">
              {t('home.stats.loading', 'Loading statistics...')}
            </div>
          ) : statistics ? (
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>{statistics.total}</h3>
                  <p>{t('home.stats.total', 'Total Flashcards')}</p>
                </div>
              </div>

              <div className="stat-card highlight">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>{statistics.dueForReview}</h3>
                  <p>{t('home.stats.due', 'Due for Review')}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>{statistics.new}</h3>
                  <p>{t('home.stats.new', 'New Cards')}</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>{statistics.mastered}</h3>
                  <p>{t('home.stats.mastered', 'Mastered')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-stats">
              {t('home.stats.no_data', 'No statistics available yet')}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="actions-section">
          <h2>{t('home.actions.title', ' Quick Actions')}</h2>
          
          <div className="action-cards">
            <button 
              className="action-card primary"
              onClick={() => navigate('/study')}
              disabled={!statistics || statistics.dueForReview === 0}
            >
              <div className="action-icon"></div>
              <h3>{t('home.actions.study.title', 'Study Session')}</h3>
              <p>
                {statistics?.dueForReview > 0 
                  ? t('home.actions.study.waiting', '{{count}} cards waiting', { count: statistics.dueForReview })
                  : t('home.actions.study.no_cards', 'No cards due today')}
              </p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/flashcards')}
            >
              <div className="action-icon"></div>
              <h3>{t('home.actions.create.title', 'Create Flashcard')}</h3>
              <p>{t('home.actions.create.subtitle', 'Add new words to learn')}</p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/review')}
            >
              <div className="action-icon"></div>
              <h3>{t('home.actions.review.title', 'Review All')}</h3>
              <p>{t('home.actions.review.subtitle', 'Browse all flashcards')}</p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/statistics')}
            >
              <div className="action-icon"></div>
              <h3>{t('home.actions.statistics.title', 'Statistics')}</h3>
              <p>{t('home.actions.statistics.subtitle', 'View detailed progress')}</p>
            </button>
          </div>
        </div>

        {/* Level Distribution */}
        {statistics && (
          <div className="level-section">
            <h2>{t('home.levels.title', ' Knowledge Levels')}</h2>
            <div className="level-bars">
              {[1, 2, 3, 4, 5].map(level => {
                const count = statistics.byLevel[`level${level}`] || 0;
                const percentage = statistics.total > 0 
                  ? (count / statistics.total) * 100 
                  : 0;

                return (
                  <div key={level} className="level-bar">
                    <div className="level-info">
                      <span>{t('home.levels.level', 'Level {{number}}', { number: level })}</span>
                      <span>{t('home.levels.cards', '{{count}} cards', { count })}</span>
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
          <span></span>
          <span>{t('nav.home', 'Home')}</span>
        </button>
        <button onClick={() => navigate('/flashcards')} className="nav-item">
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

export default Home;
