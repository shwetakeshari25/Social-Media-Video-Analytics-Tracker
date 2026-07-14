import React, { useState } from 'react';

export default function Home({ onCompareStart }) {
  const [urlInput, setUrlInput] = useState('');
  const [stagedLinks, setStagedLinks] = useState([]);
  const [error, setError] = useState('');

  const handleAddLink = (e) => {
    e.preventDefault();
    setError('');

    const url = urlInput.trim();
    if (!url) return;

    // Direct basic validation for duplicate staged links
    if (stagedLinks.includes(url)) {
      setError('This link is already in your list.');
      return;
    }

    // Try to detect platform quickly
    const isYt = /youtube\.com|youtu\.be/i.test(url);
    const isIg = /instagram\.com/i.test(url);
    const isLi = /linkedin\.com/i.test(url);
    const isTt = /tiktok\.com/i.test(url);

    if (!isYt && !isIg && !isLi && !isTt) {
      setError('Please enter a valid YouTube, Instagram, LinkedIn, or TikTok link.');
      return;
    }

    setStagedLinks([...stagedLinks, url]);
    setUrlInput('');
  };

  const handleRemoveLink = (indexToRemove) => {
    setStagedLinks(stagedLinks.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCompareClick = () => {
    if (stagedLinks.length === 0) {
      setError('Please add at least one link to compare.');
      return;
    }
    // Callback to App.jsx to run loading phase and bulk imports
    onCompareStart(stagedLinks);
    setStagedLinks([]); // Reset staging after starting
  };

  const getPlatformIcon = (url) => {
    if (/youtube\.com|youtu\.be/i.test(url)) return '🔴 YouTube';
    if (/instagram\.com/i.test(url)) return '📸 Instagram';
    if (/linkedin\.com/i.test(url)) return '🔵 LinkedIn';
    if (/tiktok\.com/i.test(url)) return '🎵 TikTok';
    return '🔗 Link';
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div className="card" style={styles.card}>
        <h1 style={styles.mainTitle}>Social Media Video Analytics Tracker</h1>
        <p style={styles.description}>
          Paste video links from YouTube, Instagram, or LinkedIn to track engagement metrics, compare metrics, and generate AI scripts.
        </p>

        <form onSubmit={handleAddLink} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              className="input-field"
              placeholder="Paste Video Link (YouTube, Instagram, or LinkedIn)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              style={styles.input}
            />
            {error && <p style={styles.errorText}>{error}</p>}
          </div>

          <button type="submit" className="btn btn-primary" style={styles.addBtn}>
            <span>＋</span> Add Link
          </button>
        </form>

        <div style={styles.divider}></div>

        <h3 style={styles.sectionTitle}>Added Videos ({stagedLinks.length})</h3>

        {stagedLinks.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔗</div>
            <p>No links added yet. Paste a link above to get started.</p>
          </div>
        ) : (
          <div style={styles.listContainer}>
            {stagedLinks.map((link, index) => (
              <div key={index} style={styles.listItem}>
                <div style={styles.linkInfo}>
                  <span style={styles.index}>{index + 1}.</span>
                  <span style={styles.platformBadge}>{getPlatformIcon(link)}</span>
                  <span style={styles.urlText}>{link}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  style={styles.removeBtn}
                  title="Remove Link"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleCompareClick}
          className="btn btn-primary"
          style={styles.compareBtn}
          disabled={stagedLinks.length === 0}
        >
          Compare Videos
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px',
  },
  card: {
    padding: '36px',
    boxShadow: '0 8px 30px rgba(62, 49, 37, 0.05)',
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-color)',
    textAlign: 'center',
    marginBottom: '8px',
  },
  description: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: '32px',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  input: {
    height: '48px',
    fontSize: '15px',
  },
  errorText: {
    fontSize: '13px',
    color: 'var(--error-color)',
    fontWeight: '500',
    paddingLeft: '4px',
  },
  addBtn: {
    height: '48px',
    padding: '0 24px',
    whiteSpace: 'nowrap',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '32px 0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
    color: 'var(--text-color)',
  },
  emptyState: {
    backgroundColor: 'rgba(166, 124, 82, 0.02)',
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '36px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
    opacity: '0.6',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '32px',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'var(--card-color)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
  },
  linkInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflow: 'hidden',
    flex: 1,
  },
  index: {
    fontWeight: '700',
    color: 'var(--primary-color)',
  },
  platformBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    backgroundColor: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
  },
  urlText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px 8px',
    transition: 'color var(--transition-fast)',
  },
  compareBtn: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '700',
    boxShadow: '0 4px 14px rgba(166, 124, 82, 0.2)',
  },
};
