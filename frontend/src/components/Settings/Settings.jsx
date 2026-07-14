import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config.js';

export default function Settings({ onToggleDarkMode, isDarkMode }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch current settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('video_tracker_token');
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setGeminiKey(data.apiKeys?.gemini || '');
          setYoutubeKey(data.apiKeys?.youtube || '');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('video_tracker_token');
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          apiKeys: {
            gemini: geminiKey.trim(),
            youtube: youtubeKey.trim()
          },
          darkMode: isDarkMode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save settings.');
      }

      const data = await response.json();
      setMessage('Settings updated successfully! ✓');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>System Settings</h2>
        <p style={styles.subtitle}>Configure credentials, custom API connections, and interface preferences.</p>
      </div>

      <div style={styles.grid}>
        {/* Left Side: Keys Card */}
        <div className="card" style={styles.card}>
          <h3 style={styles.cardTitle}>🔑 API Connections</h3>
          <p style={styles.cardDesc}>Save keys to enable real-time YouTube metadata fetching and advanced Gemini generative copy templates.</p>
          
          {message && <div style={styles.successAlert}>{message}</div>}
          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSave} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Google Gemini API Key</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter AI API Key (AI generation fallback will be used if left blank)..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                disabled={loading}
              />
              <span style={styles.inputTip}>Used for customized hook parsing and storytelling script generation.</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>YouTube Data API v3 Key</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter YouTube Data API Key..."
                value={youtubeKey}
                onChange={(e) => setYoutubeKey(e.target.value)}
                disabled={loading}
              />
              <span style={styles.inputTip}>Used to fetch real statistics (views, likes, comments) from YouTube URLs.</span>
            </div>

            <button type="submit" className="btn btn-primary" style={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Right Side: Visual Toggles */}
        <div style={styles.sidebarGrid}>
          <div className="card" style={styles.toggleCard}>
            <h3 style={styles.cardTitle}>🎨 Interface Theme</h3>
            <p style={styles.cardDesc}>Toggle layout aesthetics. Dark Mode is ready for previews!</p>
            
            <div style={styles.divider}></div>
            
            <div style={styles.toggleRow}>
              <div>
                <strong style={{ fontSize: '14px' }}>Dark Theme Preview</strong>
                <p style={styles.toggleSub}>Switch between Warm Light Brown and Charcoal Dark Theme</p>
              </div>
              
              <button 
                onClick={onToggleDarkMode} 
                style={{
                  ...styles.themeToggleBtn,
                  backgroundColor: isDarkMode ? 'var(--primary-color)' : 'transparent',
                  borderColor: isDarkMode ? 'var(--primary-color)' : 'var(--border-color)',
                  color: isDarkMode ? '#FFFDFB' : 'var(--text-color)'
                }}
              >
                {isDarkMode ? '🌙 Dark Mode: ON' : '☀️ Light Mode: ON'}
              </button>
            </div>
          </div>

          <div className="card" style={styles.infoCard}>
            <h3 style={styles.cardTitle}>ℹ️ Integration Info</h3>
            <div style={styles.infoContent}>
              <div style={styles.infoItem}>
                <strong>Simulation Fallback:</strong>
                <p>If no API keys are configured, the system uses a smart rule-based simulator that parses url inputs and builds beautiful engagement graphics and scripts automatically.</p>
              </div>
              <div style={styles.infoItem}>
                <strong>Security:</strong>
                <p>All keys are saved locally inside your secure project database and never transmitted to external analytics handlers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-color)',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '32px',
    alignItems: 'flex-start',
  },
  card: {
    padding: '32px',
  },
  sidebarGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  toggleCard: {
    padding: '24px',
  },
  infoCard: {
    padding: '24px',
    backgroundColor: 'rgba(166, 124, 82, 0.02)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  successAlert: {
    backgroundColor: '#FAF0EE',
    color: 'var(--success-color)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    borderLeft: '4px solid var(--success-color)',
  },
  errorAlert: {
    backgroundColor: '#FAF0EE',
    color: 'var(--error-color)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    borderLeft: '4px solid var(--error-color)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  inputTip: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  saveBtn: {
    alignSelf: 'flex-start',
    padding: '12px 24px',
    marginTop: '12px',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '16px 0',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  toggleSub: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  themeToggleBtn: {
    padding: '10px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    fontFamily: 'var(--font-family)',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  infoContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  infoItem: {
    fontSize: '13px',
    lineHeight: '1.5',
  },
};
