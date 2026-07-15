import React, { useState } from 'react';

// Format numbers elegantly (e.g., 100K, 2.5M)
export function formatMetric(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export default function Dashboard({ videos, onDeleteVideo, onUpdateVideo, onGenerateScript }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [scriptLength, setScriptLength] = useState('5 min'); // Pre-selected 5 min
  const [errorMsg, setErrorMsg] = useState('');

  // State for editing a video
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editViews, setEditViews] = useState('');
  const [editLikes, setEditLikes] = useState('');
  const [editComments, setEditComments] = useState('');
  const [editShares, setEditShares] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleSelectToggle = (id) => {
    setErrorMsg('');
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      if (selectedIds.length >= 4) {
        setErrorMsg('You can select a maximum of 4 videos for script generation.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleGenerateClick = () => {
    if (selectedIds.length < 2) {
      setErrorMsg('Please select at least 2 videos to compare and generate a script.');
      return;
    }
    if (selectedIds.length > 4) {
      setErrorMsg('Please select between 2 and 4 videos.');
      return;
    }
    // Callback to App.jsx to handle script generation transition
    onGenerateScript(selectedIds, scriptLength);
  };

  const getPlatformClass = (platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube': return { color: '#E05A47', label: 'YouTube' };
      case 'instagram': return { color: '#D46387', label: 'Instagram' };
      case 'linkedin': return { color: '#407B9E', label: 'LinkedIn' };
      case 'tiktok': return { color: '#3A3A3A', label: 'TikTok' };
      default: return { color: 'var(--primary-color)', label: platform };
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Video Analytics Dashboard</h2>
          <p style={styles.subtitle}>Select 2 to 4 videos from the grid below to compile comparisons and generate custom AI scripts.</p>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="card" style={styles.emptyState}>
          <h3>No tracked videos yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Go to the <strong>Home</strong> tab and paste some video links to populate your dashboard!
          </p>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {videos.map((video) => {
              const platformInfo = getPlatformClass(video.platform);
              const isSelected = selectedIds.includes(video.id);

              return (
                <div 
                  key={video.id} 
                  className={`card ${isSelected ? 'selected-card' : ''}`}
                  style={{
                    ...styles.card,
                    borderColor: isSelected ? 'var(--primary-color)' : 'var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(166, 124, 82, 0.02)' : 'var(--card-color)'
                  }}
                  onClick={() => handleSelectToggle(video.id)}
                >
                  <div style={styles.thumbnailWrapper}>
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      style={styles.thumbnail}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=360&auto=format&fit=crop&q=60';
                      }}
                    />
                    <span style={{ ...styles.platformTag, backgroundColor: platformInfo.color }}>
                      {platformInfo.label}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVideo(video);
                        setEditTitle(video.title);
                        setEditViews(video.views.toString());
                        setEditLikes(video.likes.toString());
                        setEditComments(video.comments.toString());
                        setEditShares(video.shares.toString());
                      }}
                      style={styles.editCardBtn}
                      title="Edit Metrics"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this video?')) {
                          onDeleteVideo(video.id);
                          setSelectedIds(selectedIds.filter(id => id !== video.id));
                        }
                      }}
                      style={styles.deleteCardBtn}
                      title="Delete Video"
                    >
                      ✕
                    </button>
                  </div>

                  <div style={styles.cardContent}>
                    <h4 style={styles.videoTitle} title={video.title}>{video.title}</h4>
                    
                    <div style={styles.statsGrid}>
                      <div style={styles.statBox}>
                        <span style={styles.statLabel}>Views</span>
                        <span style={styles.statVal}>{formatMetric(video.views)}</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statLabel}>Likes</span>
                        <span style={styles.statVal}>{formatMetric(video.likes)}</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statLabel}>Comments</span>
                        <span style={styles.statVal}>{formatMetric(video.comments)}</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statLabel}>Shares</span>
                        <span style={styles.statVal}>{formatMetric(video.shares)}</span>
                      </div>
                    </div>

                    <div style={styles.selectContainer}>
                      <label style={styles.checkboxLabel} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectToggle(video.id)}
                          style={styles.checkbox}
                        />
                        <span style={isSelected ? styles.checkboxTextSelected : styles.checkboxText}>
                          {isSelected ? '✓ Selected' : 'Select'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Panel */}
          <div style={styles.bottomPanelSpacer}></div>
          <div style={styles.bottomPanel} className="animate-fade-in">
            <div style={styles.bottomPanelContent}>
              <div style={styles.bottomLeft}>
                <div style={styles.selectionCount}>
                  Selected Videos: <strong style={{ color: 'var(--primary-color)' }}>{selectedIds.length}</strong> <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>(Select 2-4)</span>
                </div>
                {errorMsg && <div style={styles.bottomError}>{errorMsg}</div>}
              </div>

              <div style={styles.bottomRight}>
                <div style={styles.lengthConfig}>
                  <span style={styles.configLabel}>Script Length:</span>
                  <div style={styles.radioGroup}>
                    {['30 sec', '1 min', '3 min', '5 min'].map((len) => (
                      <label key={len} style={styles.radioLabel}>
                        <input
                          type="radio"
                          name="scriptLength"
                          value={len}
                          checked={scriptLength === len}
                          onChange={(e) => setScriptLength(e.target.value)}
                          style={styles.radio}
                        />
                        <span style={scriptLength === len ? styles.radioTextSelected : styles.radioText}>
                          {len}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateClick}
                  className="btn btn-primary"
                  style={styles.generateBtn}
                  disabled={selectedIds.length < 2 || selectedIds.length > 4}
                >
                  Generate Script
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal Overlay */}
      {editingVideo && (
        <div style={styles.modalOverlay} onClick={() => setEditingVideo(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>✏️ Edit Video Details</h3>
            <p style={styles.modalSubtitle}>
              Update the metrics for this video.
              {editingVideo.platform === 'Instagram' && (
                <span style={styles.modalTip}>
                  <br /><strong>Note:</strong> Instagram views and shares are estimated because Instagram hides them in public HTML headers. You can enter the exact values here.
                </span>
              )}
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSavingEdit(true);
              const success = await onUpdateVideo(editingVideo.id, {
                title: editTitle.trim(),
                views: parseInt(editViews) || 0,
                likes: parseInt(editLikes) || 0,
                comments: parseInt(editComments) || 0,
                shares: parseInt(editShares) || 0
              });
              setIsSavingEdit(false);
              if (success) {
                setEditingVideo(null);
              } else {
                alert("Failed to update video. Please try again.");
              }
            }} style={styles.modalForm}>
              
              <div style={styles.modalFormGroup}>
                <label style={styles.modalLabel}>Video Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div style={styles.modalGrid}>
                <div style={styles.modalFormGroup}>
                  <label style={styles.modalLabel}>Views</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input-field"
                    value={editViews}
                    onChange={(e) => setEditViews(e.target.value)}
                  />
                </div>
                <div style={styles.modalFormGroup}>
                  <label style={styles.modalLabel}>Likes</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input-field"
                    value={editLikes}
                    onChange={(e) => setEditLikes(e.target.value)}
                  />
                </div>
                <div style={styles.modalFormGroup}>
                  <label style={styles.modalLabel}>Comments</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input-field"
                    value={editComments}
                    onChange={(e) => setEditComments(e.target.value)}
                  />
                </div>
                <div style={styles.modalFormGroup}>
                  <label style={styles.modalLabel}>Shares</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input-field"
                    value={editShares}
                    onChange={(e) => setEditShares(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setEditingVideo(null)}
                  disabled={isSavingEdit}
                  style={styles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSavingEdit}
                  style={styles.modalSaveBtn}
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
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
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    marginTop: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    gap: '24px',
  },
  card: {
    padding: '0',
    overflow: 'hidden',
    cursor: 'pointer',
    borderWidth: '2px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  thumbnailWrapper: {
    position: 'relative',
    width: '100%',
    height: '150px',
    backgroundColor: 'var(--border-color)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  platformTag: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    color: '#FFFDFB',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  deleteCardBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(62, 49, 37, 0.7)',
    color: '#FFFDFB',
    border: 'none',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    transition: 'background-color var(--transition-fast)',
  },
  cardContent: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  videoTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-color)',
    lineHeight: '1.4',
    marginBottom: '16px',
    height: '40px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  statBox: {
    backgroundColor: 'var(--bg-color)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  statVal: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-color)',
    marginTop: '2px',
  },
  selectContainer: {
    marginTop: 'auto',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'center',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'center',
    padding: '4px 0',
  },
  checkbox: {
    accentColor: 'var(--primary-color)',
    width: '16px',
    height: '16px',
  },
  checkboxText: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  checkboxTextSelected: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--primary-color)',
  },
  bottomPanelSpacer: {
    height: '110px',
  },
  bottomPanel: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: 'var(--card-color)',
    borderTop: '2px solid var(--border-color)',
    padding: '16px 32px',
    boxShadow: '0 -6px 25px rgba(62, 49, 37, 0.08)',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
  },
  bottomPanelContent: {
    maxWidth: '1200px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  bottomLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  selectionCount: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  bottomError: {
    color: 'var(--error-color)',
    fontSize: '12px',
    fontWeight: '600',
  },
  bottomRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  lengthConfig: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  configLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  radioGroup: {
    display: 'flex',
    gap: '8px',
    backgroundColor: 'var(--bg-color)',
    padding: '4px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  radioLabel: {
    cursor: 'pointer',
    position: 'relative',
  },
  radio: {
    position: 'absolute',
    opacity: 0,
    cursor: 'pointer',
  },
  radioText: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'all var(--transition-fast)',
  },
  radioTextSelected: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#FFFDFB',
    backgroundColor: 'var(--primary-color)',
    padding: '6px 12px',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(166, 124, 82, 0.2)',
  },
  generateBtn: {
    padding: '12px 24px',
    boxShadow: '0 4px 12px rgba(166, 124, 82, 0.2)',
  },
  editCardBtn: {
    position: 'absolute',
    top: '12px',
    right: '42px',
    backgroundColor: 'rgba(62, 49, 37, 0.7)',
    color: '#FFFDFB',
    border: 'none',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    transition: 'background-color var(--transition-fast)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: 'var(--card-color)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(62, 49, 37, 0.15)',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-color)',
    marginBottom: '8px',
  },
  modalSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  modalTip: {
    fontSize: '11px',
    color: 'var(--primary-color)',
    fontWeight: '500',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalFormGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  modalLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
  },
  modalCancelBtn: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
  },
  modalSaveBtn: {
    padding: '10px 20px',
  },
};
