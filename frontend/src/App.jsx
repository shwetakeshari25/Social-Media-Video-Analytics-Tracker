import React, { useState, useEffect } from 'react';
import Auth from './components/Auth/Auth.jsx';
import Home from './components/Home/Home.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Compare from './components/Compare/Compare.jsx';
import ScriptGenerator from './components/ScriptGenerator/ScriptGenerator.jsx';
import History from './components/History/History.jsx';
import Settings from './components/Settings/Settings.jsx';
import { API_BASE_URL } from './config.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'dashboard', 'compare', 'script', 'history', 'settings'
  const [videos, setVideos] = useState([]);
  const [scripts, setScripts] = useState([]);
  
  // Script generator loading/result states
  const [generatorLoading, setGeneratorLoading] = useState(false);
  const [generatorError, setGeneratorError] = useState('');
  const [generatedScript, setGeneratedScript] = useState(null);
  const [selectedScriptLength, setSelectedScriptLength] = useState('5 min');
  const [selectedVideoIds, setSelectedVideoIds] = useState([]);

  // General App loader (for bulk importing URLs)
  const [appLoading, setAppLoading] = useState(false);
  const [appLoadingText, setAppLoadingText] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Auto-login on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('video_tracker_token');
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Invalid token');
      })
      .then(userData => {
        setUser(userData);
        fetchDashboardData();
      })
      .catch(() => {
        localStorage.removeItem('video_tracker_token');
      });
    }
  }, []);

  // Fetch videos, history, and settings
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('video_tracker_token');
    if (!token) return;

    try {
      // Fetch videos
      const vidRes = await fetch(`${API_BASE_URL}/api/videos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (vidRes.ok) {
        const vidData = await vidRes.json();
        setVideos(vidData);
      }

      // Fetch history
      const histRes = await fetch(`${API_BASE_URL}/api/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (histRes.ok) {
        const histData = await histRes.json();
        setScripts(histData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    fetchDashboardData();
    setActiveTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('video_tracker_token');
    setUser(null);
    setVideos([]);
    setScripts([]);
    setActiveTab('home');
  };

  // Start comparison from Home (Bulk imports URLs)
  const handleCompareStart = async (links) => {
    setAppLoading(true);
    setAppLoadingText('Analyzing Videos...');
    const token = localStorage.getItem('video_tracker_token');

    let successCount = 0;
    let failMsg = '';

    for (const link of links) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/videos/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url: link })
        });
        const data = await response.json();
        if (response.ok) {
          successCount++;
        } else {
          failMsg = data.error || 'Import failed';
        }
      } catch (err) {
        failMsg = 'Failed to connect to server';
      }
    }

    await fetchDashboardData();
    setAppLoading(false);
    setAppLoadingText('');

    if (successCount > 0) {
      setActiveTab('dashboard');
    } else if (failMsg) {
      alert(`Could not analyze links: ${failMsg}`);
    }
  };

  const handleDeleteVideo = async (id) => {
    const token = localStorage.getItem('video_tracker_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setVideos(videos.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete video:', err);
    }
  };

  const handleDeleteScript = async (id) => {
    const token = localStorage.getItem('video_tracker_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setScripts(scripts.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete script:', err);
    }
  };

  // Trigger script generation (Transitions to ScriptGenerator component)
  const handleGenerateScript = async (videoIds, length) => {
    setSelectedVideoIds(videoIds);
    setSelectedScriptLength(length);
    setGeneratorLoading(true);
    setGeneratorError('');
    setGeneratedScript(null);
    setActiveTab('script'); // Switch page tab to generator loader

    const token = localStorage.getItem('video_tracker_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/script/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoIds, length })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred during script generation.');
      }

      setGeneratedScript(data.scriptData);
      fetchDashboardData(); // Refresh history listing
    } catch (err) {
      setGeneratorError(err.message);
    } finally {
      setGeneratorLoading(false);
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>🎬</span>
          <div>
            <h1 style={styles.brandName}>Antigravity</h1>
            <span style={styles.brandSubtitle}>Video Tracker</span>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'home', label: '🏠 Home' },
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'compare', label: '⚔️ Compare' },
            { id: 'history', label: '📜 History' },
            { id: 'settings', label: '⚙️ Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navBtn,
                backgroundColor: activeTab === tab.id ? 'rgba(166, 124, 82, 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-color)',
                fontWeight: activeTab === tab.id ? '700' : '500'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={styles.userProfile}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>👤</div>
            <div style={styles.userMeta}>
              <span style={styles.username}>{user.username}</span>
              <span style={styles.role}>Content Creator</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main style={styles.mainContent}>
        {/* Bulk Loading Overlay */}
        {appLoading && (
          <div style={styles.loadingOverlay}>
            <div className="card animate-fade-in" style={styles.loadingCard}>
              <div className="spinner" style={styles.mainSpinner}></div>
              <h3 style={{ marginTop: '16px' }}>{appLoadingText}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
                Extracting engagements & platform analytics...
              </p>
            </div>
          </div>
        )}

        {/* Dynamic page swap layout */}
        {activeTab === 'home' && (
          <Home onCompareStart={handleCompareStart} />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard
            videos={videos}
            onDeleteVideo={handleDeleteVideo}
            onGenerateScript={handleGenerateScript}
          />
        )}
        {activeTab === 'compare' && (
          <Compare videos={videos} />
        )}
        {activeTab === 'script' && (
          <ScriptGenerator
            selectedIds={selectedVideoIds}
            scriptLength={selectedScriptLength}
            onBackToDashboard={() => setActiveTab('dashboard')}
            scriptData={generatedScript}
            loading={generatorLoading}
            error={generatorError}
          />
        )}
        {activeTab === 'history' && (
          <History
            scripts={scripts}
            onDeleteScript={handleDeleteScript}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
          />
        )}
      </main>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--card-color)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    padding: '24px',
    zIndex: 90,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '36px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
  },
  brandIcon: {
    fontSize: '28px',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '800',
    lineHeight: '1.2',
  },
  brandSubtitle: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    transition: 'all var(--transition-fast)',
    fontFamily: 'var(--font-family)',
  },
  userProfile: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    fontSize: '20px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  username: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-color)',
  },
  role: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-family)',
    transition: 'all var(--transition-fast)',
  },
  mainContent: {
    flex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-color)',
    overflowY: 'auto',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 247, 242, 0.75)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  loadingCard: {
    padding: '36px 48px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(62,49,37,0.06)',
  },
  mainSpinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(166,124,82,0.2)',
    borderTopColor: 'var(--primary-color)',
    borderRadius: '50%',
    margin: '0 auto',
  },
};
