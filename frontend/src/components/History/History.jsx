import React, { useState } from 'react';

export default function History({ scripts, onDeleteScript }) {
  const [activeScript, setActiveScript] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const filteredScripts = scripts.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.length.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (script) => {
    const formattedText = `
TITLE: ${script.scriptData.title}
LENGTH: ${script.length}
DATE: ${new Date(script.createdAt).toLocaleDateString()}

BEST HOOK:
${script.scriptData.bestHook}

INTRODUCTION:
${script.scriptData.introduction}

MAIN CONTENT:
${script.scriptData.mainContent}

STORY:
${script.scriptData.story}

CALL TO ACTION:
${script.scriptData.callToAction}

ENDING:
${script.scriptData.ending}

-------------------------
CAPTION:
${script.scriptData.caption}

HASHTAGS:
${script.scriptData.hashtags}
    `.trim();

    navigator.clipboard.writeText(formattedText).then(() => {
      setCopySuccess('Copied! ✓');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>AI Script History</h2>
        <p style={styles.subtitle}>Review, copy, and export previously generated social media video scripts.</p>
      </div>

      <div style={styles.searchBarWrapper}>
        <input
          type="text"
          className="input-field"
          placeholder="Search scripts by title or length..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {filteredScripts.length === 0 ? (
        <div className="card" style={styles.emptyState}>
          <h3>No scripts found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            {searchQuery ? 'Try adjusting your search filter.' : 'Your generated scripts will appear here once you run the generator!'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredScripts.map((script) => (
            <div key={script.id} className="card" style={styles.historyCard} onClick={() => setActiveScript(script)}>
              <div style={styles.cardHeader}>
                <span style={styles.dateLabel}>{new Date(script.createdAt).toLocaleDateString()}</span>
                <span style={styles.lengthBadge}>{script.length}</span>
              </div>
              <h4 style={styles.cardTitle}>{script.title}</h4>
              <p style={styles.cardSnippet}>{script.scriptData?.bestHook?.substring(0, 80)}...</p>
              
              <div style={styles.cardFooter}>
                <span style={styles.viewLink}>View Script →</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this script from history?')) {
                      onDeleteScript(script.id);
                    }
                  }}
                  style={styles.deleteBtn}
                  title="Delete from history"
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Script Details Modal Overlay */}
      {activeScript && (
        <div style={styles.modalOverlay} onClick={() => setActiveScript(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="animate-fade-in">
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalDate}>{new Date(activeScript.createdAt).toLocaleString()}</span>
                <h3 style={styles.modalTitle}>{activeScript.title}</h3>
                <span style={styles.modalLength}>Duration: {activeScript.length}</span>
              </div>
              <button style={styles.closeModalBtn} onClick={() => setActiveScript(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalGrid}>
                {/* Left Side: Steps */}
                <div style={styles.modalSteps}>
                  {[
                    { key: 'bestHook', label: '🪝 Hook' },
                    { key: 'introduction', label: '👋 Intro' },
                    { key: 'mainContent', label: '📖 Content' },
                    { key: 'story', label: '💡 Story' },
                    { key: 'callToAction', label: '📣 CTA' },
                    { key: 'ending', label: '🚪 Ending' }
                  ].map((sec) => (
                    <div key={sec.key} style={styles.modalSectionBox}>
                      <h5 style={styles.modalSectionTitle}>{sec.label}</h5>
                      <p style={styles.modalSectionText}>{activeScript.scriptData[sec.key]}</p>
                    </div>
                  ))}
                </div>

                {/* Right Side: Caption */}
                <div style={styles.modalSidebar}>
                  <h5 style={styles.modalSectionTitle}>💬 Caption</h5>
                  <p style={styles.modalCaptionBox}>{activeScript.scriptData.caption}</p>
                  
                  <h5 style={{ ...styles.modalSectionTitle, marginTop: '16px' }}>#️⃣ Hashtags</h5>
                  <p style={styles.modalHashtagBox}>{activeScript.scriptData.hashtags}</p>

                  <div style={styles.modalActions}>
                    <button onClick={() => handleCopy(activeScript)} className="btn btn-primary" style={{ width: '100%' }}>
                      {copySuccess || '📋 Copy Script Text'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
    marginBottom: '24px',
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
  searchBarWrapper: {
    marginBottom: '28px',
  },
  searchInput: {
    maxWidth: '400px',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  historyCard: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: '180px',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  lengthBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-color)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginTop: '10px',
  },
  cardSnippet: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: '8px 0 auto 0',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '10px',
  },
  viewLink: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--primary-color)',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--error-color)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(62, 49, 37, 0.4)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalContent: {
    backgroundColor: 'var(--card-color)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 50px rgba(62, 49, 37, 0.15)',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalDate: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '800',
    marginTop: '4px',
  },
  modalLength: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--primary-color)',
    display: 'inline-block',
    marginTop: '4px',
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1.2fr',
    gap: '24px',
  },
  modalSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalSectionBox: {
    backgroundColor: 'var(--bg-color)',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  modalSectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--primary-color)',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  modalSectionText: {
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  modalSidebar: {
    backgroundColor: 'rgba(166, 124, 82, 0.02)',
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    height: 'fit-content',
    position: 'sticky',
    top: 0,
  },
  modalCaptionBox: {
    fontSize: '13px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    backgroundColor: 'var(--card-color)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  modalHashtagBox: {
    fontSize: '13px',
    color: 'var(--primary-color)',
    fontWeight: '600',
    backgroundColor: 'var(--card-color)',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  modalActions: {
    marginTop: '20px',
  },
};
