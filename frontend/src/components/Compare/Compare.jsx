import React, { useState } from 'react';
import { formatMetric } from '../Dashboard/Dashboard.jsx';

export default function Compare({ videos }) {
  const [activeChartMetric, setActiveChartMetric] = useState('views');

  if (videos.length === 0) {
    return (
      <div style={styles.container} className="animate-fade-in">
        <div className="card" style={styles.emptyState}>
          <h3>No videos to compare</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Add videos in the <strong>Home</strong> tab first.
          </p>
        </div>
      </div>
    );
  }

  // Helper to get max value for scaling SVG bars
  const getMaxValue = (metric) => {
    const vals = videos.map(v => v[metric] || 0);
    return Math.max(...vals, 1); // Avoid division by zero
  };

  const metricsInfo = {
    views: { label: 'Views', color: '#A67C52', key: 'views' },
    likes: { label: 'Likes', color: '#C89666', key: 'likes' },
    comments: { label: 'Comments', color: '#D4B28C', key: 'comments' },
    shares: { label: 'Shares', color: '#7B6A58', key: 'shares' }
  };

  const activeMetric = metricsInfo[activeChartMetric];
  const maxVal = getMaxValue(activeMetric.key);

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Performance Comparison</h2>
        <p style={styles.subtitle}>Analyze and compare video engagement rates side-by-side.</p>
      </div>

      {/* Table Section */}
      <div className="card animate-fade-in" style={styles.tableCard}>
        <h3 style={styles.sectionTitle}>Comparison Table</h3>
        <div style={styles.tableWrapper}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Video Title</th>
                <th>Platform</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Shares</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id}>
                  <td style={styles.tableTitleCell} title={video.url}>
                    <div style={styles.titleWithThumb}>
                      <img 
                        src={video.thumbnailUrl} 
                        alt="" 
                        style={styles.tableThumb}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&auto=format&fit=crop&q=60';
                        }}
                      />
                      <span style={styles.tableVideoTitle}>{video.title}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      ...styles.platformTag,
                      backgroundColor: video.platform === 'YouTube' ? 'rgba(224, 90, 71, 0.1)' :
                                       video.platform === 'Instagram' ? 'rgba(212, 99, 135, 0.1)' :
                                       'rgba(64, 123, 158, 0.1)',
                      color: video.platform === 'YouTube' ? '#E05A47' :
                             video.platform === 'Instagram' ? '#D46387' :
                             '#407B9E'
                    }}>
                      {video.platform}
                    </span>
                  </td>
                  <td style={styles.numericCell}>{formatMetric(video.views)}</td>
                  <td style={styles.numericCell}>{formatMetric(video.likes)}</td>
                  <td style={styles.numericCell}>{formatMetric(video.comments)}</td>
                  <td style={styles.numericCell}>{formatMetric(video.shares)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom SVG Charts Section */}
      <div className="card animate-fade-in" style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.sectionTitle}>Analytics Visualizer</h3>
          
          <div style={styles.chartToggles}>
            {Object.values(metricsInfo).map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveChartMetric(m.key)}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: activeChartMetric === m.key ? 'var(--primary-color)' : 'transparent',
                  color: activeChartMetric === m.key ? '#FFFDFB' : 'var(--text-color)',
                  borderColor: activeChartMetric === m.key ? 'var(--primary-color)' : 'var(--border-color)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.chartBody}>
          <div style={styles.yAxisLabel}>
            <span>Videos</span>
          </div>

          <div style={styles.chartBarsContainer}>
            {videos.map((video, idx) => {
              const value = video[activeMetric.key] || 0;
              const percentage = Math.max((value / maxVal) * 100, 3); // minimum 3% width for display visibility

              return (
                <div key={video.id} style={styles.chartRow}>
                  {/* Left Label */}
                  <div style={styles.chartLabelCell}>
                    <span style={styles.chartLabelIndex}>{idx + 1}</span>
                    <span style={styles.chartLabelTitle} title={video.title}>
                      {video.title.replace(/^\[.*?\]\s*/, '')}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div style={styles.chartBarWrapper}>
                    <div style={styles.barTrack}>
                      <div 
                        style={{
                          ...styles.barFill,
                          width: `${percentage}%`,
                          backgroundColor: activeMetric.color,
                        }}
                      >
                        <span style={styles.barValue}>{formatMetric(value)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: activeMetric.color }}></span>
            <span style={styles.legendText}>Comparing {activeMetric.label} (Highest: {formatMetric(maxVal)})</span>
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
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    marginTop: '24px',
  },
  tableCard: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    color: 'var(--text-color)',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  titleWithThumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '220px',
  },
  tableThumb: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  tableVideoTitle: {
    fontWeight: '600',
    color: 'var(--text-color)',
    fontSize: '13px',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  tableTitleCell: {
    maxWidth: '300px',
  },
  platformTag: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '12px',
  },
  numericCell: {
    fontWeight: '700',
    color: 'var(--text-color)',
  },
  chartCard: {
    padding: '28px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '28px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
  },
  chartToggles: {
    display: 'flex',
    gap: '8px',
  },
  toggleBtn: {
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontFamily: 'var(--font-family)',
    transition: 'all var(--transition-fast)',
  },
  chartBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  yAxisLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
  },
  chartBarsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  chartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  chartLabelCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '220px',
  },
  chartLabelIndex: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    color: 'var(--primary-color)',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLabelTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-color)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chartBarWrapper: {
    flex: 1,
    minWidth: '200px',
  },
  barTrack: {
    height: '28px',
    backgroundColor: 'rgba(166, 124, 82, 0.05)',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid var(--border-color)',
  },
  barFill: {
    height: '100%',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '12px',
    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.05)',
  },
  barValue: {
    color: '#FFFDFB',
    fontSize: '11px',
    fontWeight: '700',
    textShadow: '0 1px 2px rgba(62, 49, 37, 0.3)',
  },
  legend: {
    marginTop: '28px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
};
