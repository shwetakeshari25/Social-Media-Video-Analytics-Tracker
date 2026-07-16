import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config.js';
import OAuthModal from './OAuthModal.jsx';

export default function AnalyticsDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'growth' | 'compare'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showOAuth, setShowOAuth] = useState(false);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartMetrics, setChartMetrics] = useState({}); // accountId -> array of metrics
  const [editingAccount, setEditingAccount] = useState(null);
  const [editFollowers, setEditFollowers] = useState('');
  const [editPosts, setEditPosts] = useState('');
  const [editViews, setEditViews] = useState('');
  const [editFollowing, setEditFollowing] = useState('');
  
  const canvasRef = useRef(null);

  // Fetch accounts on load
  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('video_tracker_token');
      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
        // Fetch metrics for connected accounts
        data.forEach(a => fetchMetrics(a._id || a.id));
      } else {
        throw new Error('Failed to fetch accounts.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (accountId) => {
    try {
      const token = localStorage.getItem('video_tracker_token');
      const response = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChartMetrics(prev => ({ ...prev, [accountId]: data }));
      }
    } catch (err) {
      console.error(`Failed to fetch metrics for ${accountId}:`, err);
    }
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const token = localStorage.getItem('video_tracker_token');
      const response = await fetch(`${API_BASE_URL}/api/accounts/insights`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInsights(data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchInsights();
  }, []);

  // Redraw Canvas charts whenever tab shifts to 'growth' or metrics update
  useEffect(() => {
    if (activeTab === 'growth' && canvasRef.current) {
      renderGrowthChart();
    }
  }, [activeTab, chartMetrics, accounts]);

  const handleOpenEditModal = (acc) => {
    setEditingAccount(acc);
    setEditFollowers(acc.followers);
    setEditPosts(acc.totalPosts);
    setEditViews(acc.totalViews || 0);
    setEditFollowing(acc.following || 0);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const id = editingAccount._id || editingAccount.id;
    try {
      const token = localStorage.getItem('video_tracker_token');
      const response = await fetch(`${API_BASE_URL}/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          followers: parseInt(editFollowers) || 0,
          totalPosts: parseInt(editPosts) || 0,
          totalViews: parseInt(editViews) || 0,
          following: parseInt(editFollowing) || 0
        })
      });

      if (response.ok) {
        setEditingAccount(null);
        fetchAccounts();
        fetchInsights();
      } else {
        alert('Failed to update metrics.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating metrics.');
    }
  };

  const handleConnectAccount = async (platform, verifiedPayload) => {
    try {
      const token = localStorage.getItem('video_tracker_token');
      const response = await fetch(`${API_BASE_URL}/api/accounts/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          platform,
          ...verifiedPayload
        })
      });

      if (response.ok) {
        fetchAccounts();
        fetchInsights();
      } else {
        const resJson = await response.json();
        throw new Error(resJson.error || 'Failed to connect account.');
      }
    } catch (err) {
      console.error(err);
      throw err; // throw back to OAuthModal to display on modal error card
    }
  };

  const handleDisconnect = async (id) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;
    try {
      const token = localStorage.getItem('video_tracker_token');
      const response = await fetch(`${API_BASE_URL}/api/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAccounts();
        fetchInsights();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('video_tracker_token');
      const response = await fetch(`${API_BASE_URL}/api/accounts/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAccounts();
        fetchInsights();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  // HTML5 Canvas Growth Chart Drawing Helper
  const renderGrowthChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Filter accounts that have metrics
    const accountsWithMetrics = accounts.filter(a => chartMetrics[a._id || a.id] && chartMetrics[a._id || a.id].length > 0);
    if (accountsWithMetrics.length === 0) {
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#7B6A58';
      ctx.textAlign = 'center';
      ctx.fillText('No historical growth data available yet.', width / 2, height / 2);
      return;
    }

    // Colors for different platforms
    const colors = {
      YouTube: '#FF0000',
      Instagram: '#E1306C',
      Facebook: '#1877F2',
      LinkedIn: '#0A66C2'
    };

    // Determine min/max values for axis scaling
    let maxVal = 0;
    accountsWithMetrics.forEach(a => {
      const pts = chartMetrics[a._id || a.id] || [];
      pts.forEach(pt => {
        if (pt.followers > maxVal) maxVal = pt.followers;
      });
    });

    maxVal = maxVal * 1.1 || 1000; // 10% padding

    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw axes
    ctx.strokeStyle = 'var(--border-color)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw horizontal gridlines & Y labels
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#7B6A58';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      const val = Math.floor(maxVal - (maxVal / 4) * i);
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.strokeStyle = i === 4 ? 'transparent' : 'rgba(166, 124, 82, 0.1)';
      ctx.stroke();
      
      // format label (e.g. 150K)
      let formattedVal = val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' :
                         val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val;
      ctx.fillText(formattedVal, padding - 8, y + 3);
    }

    // Plot lines for each connected channel
    accountsWithMetrics.forEach(a => {
      const pts = chartMetrics[a._id || a.id] || [];
      if (pts.length < 2) return;

      ctx.strokeStyle = colors[a.platform] || '#A67C52';
      ctx.lineWidth = 3;
      ctx.beginPath();

      pts.forEach((pt, idx) => {
        const x = padding + (chartWidth / (pts.length - 1)) * idx;
        const y = padding + chartHeight - (pt.followers / maxVal) * chartHeight;
        
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Draw node points
        ctx.fillStyle = colors[a.platform] || '#A67C52';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.stroke();
    });

    // Draw X labels (dates)
    const firstAccPts = chartMetrics[accountsWithMetrics[0]._id || accountsWithMetrics[0].id] || [];
    ctx.fillStyle = '#7B6A58';
    ctx.textAlign = 'center';
    firstAccPts.forEach((pt, idx) => {
      const x = padding + (chartWidth / (firstAccPts.length - 1)) * idx;
      const d = new Date(pt.recordedAt);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      ctx.fillText(dateStr, x, height - padding + 15);
    });

    // Draw Chart Legends
    ctx.textAlign = 'left';
    accountsWithMetrics.forEach((a, idx) => {
      const x = padding + 120 * idx;
      const y = padding - 15;
      ctx.fillStyle = colors[a.platform] || '#A67C52';
      ctx.fillRect(x, y - 8, 12, 8);
      ctx.fillStyle = 'var(--text-color)';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(a.profileName.length > 12 ? a.profileName.substring(0, 11) + '..' : a.profileName, x + 16, y);
    });
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'YouTube': return '🔴';
      case 'Instagram': return '📸';
      case 'Facebook': return '🔵';
      case 'LinkedIn': return '💼';
      default: return '🔗';
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* 1. HEADER SECTION */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📈 Social Media Analytics Dashboard</h2>
          <p style={styles.subtitle}>Unified platform tracking for all your connected social media profiles.</p>
        </div>
        <div style={styles.actions}>
          <button 
            onClick={handleRefresh} 
            className="btn btn-secondary"
            disabled={refreshing || accounts.length === 0}
          >
            {refreshing ? 'Refreshing data...' : '🔄 Refresh All Data'}
          </button>
          <button onClick={() => setShowOAuth(true)} className="btn btn-primary">
            ➕ Add Social Account
          </button>
        </div>
      </div>

      {/* 2. TAB CONTROLS */}
      <div style={styles.tabsRow}>
        {[
          { id: 'channels', label: '📢 Connected Channels' },
          { id: 'growth', label: '📊 Growth Trends' },
          { id: 'compare', label: '⚔️ Cross-Platform Compare' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === t.id ? 'var(--primary-color)' : 'transparent',
              color: activeTab === t.id ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? '700' : '400'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 3. ERRORS */}
      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      {/* 4. MAIN TABS CONTENT */}
      <div style={{ marginTop: '24px' }}>
        {/* TAB 1: CHANNELS LIST */}
        {activeTab === 'channels' && (
          <div>
            {loading ? (
              <div style={styles.loaderContainer}>
                <span className="spinner"></span> Loading channels...
              </div>
            ) : accounts.length === 0 ? (
              <div className="card" style={styles.emptyCard}>
                <span style={{ fontSize: '48px', marginBottom: '12px' }}>📊</span>
                <h3>No Connected Channels</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '8px 0 20px 0' }}>
                  Link your YouTube, Instagram, Facebook, or LinkedIn profiles to see live subscribers and analytics.
                </p>
                <button onClick={() => setShowOAuth(true)} className="btn btn-primary">
                  Connect Your First Account
                </button>
              </div>
            ) : (
              <div style={styles.channelsGrid}>
                {accounts.map(acc => {
                  const accId = acc._id || acc.id;
                  return (
                    <div key={accId} className="card" style={styles.channelCard}>
                      <div style={styles.platformBadge}>
                        {getPlatformIcon(acc.platform)} {acc.platform}
                      </div>

                      <div style={styles.cardHeader}>
                        <img 
                          src={acc.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                          alt="Avatar" 
                          style={styles.cardAvatar}
                        />
                        <div>
                          <h4 style={styles.profileName}>{acc.profileName}</h4>
                          <span style={styles.updatedText}>Updated {new Date(acc.lastUpdated).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div style={styles.statsRow}>
                        <div style={styles.statBox}>
                          <span style={styles.statVal}>
                            {acc.followers.toLocaleString()}
                          </span>
                          <span style={styles.statLabel}>
                            {acc.platform === 'YouTube' ? 'Subscribers' : 'Followers'}
                          </span>
                        </div>

                        {acc.platform !== 'YouTube' && (
                          <div style={styles.statBox}>
                            <span style={styles.statVal}>
                              {acc.following ? acc.following.toLocaleString() : '0'}
                            </span>
                            <span style={styles.statLabel}>Following</span>
                          </div>
                        )}

                        <div style={styles.statBox}>
                          <span style={styles.statVal}>
                            {acc.totalPosts.toLocaleString()}
                          </span>
                          <span style={styles.statLabel}>Posts</span>
                        </div>

                        {acc.platform === 'YouTube' && (
                          <div style={styles.statBox}>
                            <span style={styles.statVal}>
                              {acc.totalViews >= 1000000 ? (acc.totalViews / 1000000).toFixed(1) + 'M' :
                               acc.totalViews >= 1000 ? (acc.totalViews / 1000).toFixed(1) + 'K' : acc.totalViews}
                            </span>
                            <span style={styles.statLabel}>Views</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <button 
                          onClick={() => handleOpenEditModal(acc)} 
                          style={styles.editBtn}
                        >
                          ✏️ Edit Metrics
                        </button>
                        <button 
                          onClick={() => handleDisconnect(accId)} 
                          style={styles.disconnectBtn}
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GROWTH CHARTS */}
        {activeTab === 'growth' && (
          <div className="card" style={styles.chartCard}>
            <h3 style={styles.cardTitle}>Audience Size Over Last 7 Days</h3>
            <p style={styles.cardSubtitle}>Visualizing follower/subscriber expansion across your linked profiles.</p>
            
            <div style={styles.chartWrapper}>
              <canvas ref={canvasRef} width={800} height={350} style={styles.canvas}></canvas>
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM COMPARISON */}
        {activeTab === 'compare' && (
          <div className="card" style={styles.compareCard}>
            <h3 style={styles.cardTitle}>⚔️ Cross-Platform Engagement Matrix</h3>
            <p style={styles.cardSubtitle}>Compare reach and post frequency between all authorized platforms.</p>
            
            {accounts.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No platform comparison available. Connect at least two accounts.
              </p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Platform</th>
                    <th style={styles.th}>Profile</th>
                    <th style={styles.th}>Subscribers / Followers</th>
                    <th style={styles.th}>Total Posts</th>
                    <th style={styles.th}>Estimated Engagement Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => {
                    const rate = acc.followers > 0 
                      ? ((acc.totalPosts * 1.5) / (acc.followers * 0.05) * 100).toFixed(2)
                      : '0.00';
                    return (
                      <tr key={acc._id || acc.id} style={styles.tr}>
                        <td style={styles.td}>
                          <strong>{getPlatformIcon(acc.platform)} {acc.platform}</strong>
                        </td>
                        <td style={styles.td}>{acc.profileName}</td>
                        <td style={styles.td}>{acc.followers.toLocaleString()}</td>
                        <td style={styles.td}>{acc.totalPosts}</td>
                        <td style={styles.td}>
                          <span style={styles.rateBadge}>{rate > 10 ? '🔥 ' + rate : rate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* 5. AI INSIGHTS BAR */}
      {accounts.length > 0 && (
        <div className="card animate-fade-in" style={styles.insightsCard}>
          <h3 style={styles.insightsTitle}>💡 Antigravity AI Audience Insights</h3>
          <p style={styles.insightsSubtitle}>Personalized strategic guidance powered by Google Gemini AI.</p>
          
          {insightsLoading ? (
            <div style={styles.loaderContainer}>
              <span className="spinner"></span> Querying Gemini AI Engine...
            </div>
          ) : (
            <div style={styles.insightsList}>
              {insights.map((sug, idx) => (
                <div key={idx} style={styles.insightItem}>
                  <span style={styles.insightBullet}>{idx === 0 ? '🚀' : idx === 1 ? '🎯' : '📊'}</span>
                  <div style={styles.insightText}>{sug}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OAuth Connection Pop-up Modal */}
      {showOAuth && (
        <OAuthModal 
          onClose={() => setShowOAuth(false)} 
          onConnect={handleConnectAccount}
        />
      )}

      {/* Edit Metrics Pop-up Modal */}
      {editingAccount && (
        <div style={styles.modalOverlay} onClick={() => setEditingAccount(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setEditingAccount(null)}>✕</button>
            <h3 style={styles.modalTitle}>✏️ Edit {editingAccount.platform} Metrics</h3>
            <p style={styles.modalSubtitle}>Manually adjust followers, posts, and views if automatic scraping is blocked.</p>

            <form onSubmit={handleSaveEdit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {editingAccount.platform === 'YouTube' ? 'Subscribers' : 'Followers'}
                </label>
                <input
                  type="number"
                  className="input-field"
                  required
                  value={editFollowers}
                  onChange={(e) => setEditFollowers(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Total Posts</label>
                <input
                  type="number"
                  className="input-field"
                  required
                  value={editPosts}
                  onChange={(e) => setEditPosts(e.target.value)}
                />
              </div>

              {editingAccount.platform !== 'YouTube' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Following</label>
                  <input
                    type="number"
                    className="input-field"
                    required
                    value={editFollowing}
                    onChange={(e) => setEditFollowing(e.target.value)}
                  />
                </div>
              )}

              {editingAccount.platform === 'YouTube' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Views</label>
                  <input
                    type="number"
                    className="input-field"
                    required
                    value={editViews}
                    onChange={(e) => setEditViews(e.target.value)}
                  />
                </div>
              )}

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingAccount(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Metrics
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '24px',
    marginBottom: '28px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-color)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  tabsRow: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    gap: '16px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '12px 4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'border-color var(--transition-fast), color var(--transition-fast)',
    fontFamily: 'var(--font-family)',
  },
  errorAlert: {
    padding: '14px 20px',
    backgroundColor: '#FDE8E8',
    color: '#E02424',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: '600',
    marginTop: '20px',
  },
  loaderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'center',
    padding: '48px',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  emptyCard: {
    textAlign: 'center',
    padding: '64px 32px',
    maxWidth: '540px',
    margin: '40px auto',
    boxShadow: '0 8px 30px rgba(62, 49, 37, 0.04)',
  },
  channelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
  },
  channelCard: {
    padding: '24px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '240px',
  },
  platformBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'var(--bg-color)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  cardAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--border-color)',
  },
  profileName: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-color)',
  },
  updatedText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    display: 'block',
    marginTop: '2px',
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    marginBottom: '20px',
  },
  statBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  statVal: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-color)',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  disconnectBtn: {
    background: 'none',
    border: 'none',
    color: '#E02424',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0',
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-family)',
    opacity: 0.8,
    transition: 'opacity var(--transition-fast)',
    ':hover': {
      opacity: 1
    }
  },
  chartCard: {
    padding: '32px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-color)',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '28px',
  },
  chartWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  canvas: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
  },
  compareCard: {
    padding: '32px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '2px solid var(--border-color)',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
    ':hover': {
      backgroundColor: 'var(--bg-color)',
    }
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--text-color)',
  },
  rateBadge: {
    backgroundColor: '#ECFDF5',
    color: '#059669',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '700',
    fontSize: '12px',
  },
  insightsCard: {
    marginTop: '32px',
    padding: '32px',
    backgroundColor: '#FFFDF9',
    borderColor: '#F5ECE0',
    boxShadow: '0 8px 30px rgba(166, 124, 82, 0.03)',
  },
  insightsTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-color)',
  },
  insightsSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  insightItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    backgroundColor: 'var(--card-bg)',
    padding: '16px 20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  insightBullet: {
    fontSize: '20px',
  },
  insightText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--text-color)',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-color)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0',
    fontFamily: 'var(--font-family)',
    opacity: 0.8,
    transition: 'opacity var(--transition-fast)',
    ':hover': {
      opacity: 1
    }
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(62, 49, 37, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    width: '90%',
    maxWidth: '480px',
    boxShadow: '0 20px 50px rgba(62, 49, 37, 0.15)',
    border: '1px solid var(--border-color)',
    position: 'relative',
    animation: 'scaleUp 0.3s ease',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  }
};
