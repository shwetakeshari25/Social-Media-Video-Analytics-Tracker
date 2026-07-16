import React, { useState } from 'react';
import { API_BASE_URL } from '../../config.js';

const exampleUrls = {
  YouTube: {
    placeholder: 'https://www.youtube.com/@channelname',
    demo: 'https://www.youtube.com/@techcrunch',
    tip: 'Enter your YouTube handle link starting with @ (e.g. @techcrunch).'
  },
  Instagram: {
    placeholder: 'https://www.instagram.com/username',
    demo: 'https://www.instagram.com/instagram',
    tip: 'Enter your Instagram public profile URL.'
  },
  Facebook: {
    placeholder: 'https://www.facebook.com/pagename',
    demo: 'https://www.facebook.com/Google',
    tip: 'Enter your Facebook public page URL.'
  },
  LinkedIn: {
    placeholder: 'https://www.linkedin.com/in/username',
    demo: 'https://www.linkedin.com/in/shweta-keshari-014432346',
    tip: 'Enter your LinkedIn company page or personal profile URL.'
  }
};

export default function OAuthModal({ onClose, onConnect }) {
  const [platform, setPlatform] = useState(null); // 'YouTube', 'Instagram', 'Facebook', 'LinkedIn'
  const [step, setStep] = useState('select'); // 'select' | 'inputUrl' | 'verify' | 'success'
  const [profileUrl, setProfileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Scraped preview details (user can edit before connecting)
  const [scrapedData, setScrapedData] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [followers, setFollowers] = useState('');
  const [totalPosts, setTotalPosts] = useState('');
  const [totalViews, setTotalViews] = useState('');
  const [following, setFollowing] = useState('');

  const handleSelectPlatform = (selectedPlatform) => {
    setPlatform(selectedPlatform);
    setProfileUrl('');
    setError('');
    setStep('inputUrl');
  };

  const handleFetchPreview = async (e) => {
    e.preventDefault();
    if (!profileUrl) return setError('Please enter a profile URL');
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('video_tracker_token');
      const response = await fetch(`${API_BASE_URL}/api/accounts/scrape-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ platform, profileUrl })
      });
      
      if (response.ok) {
        const data = await response.json();
        setScrapedData(data);
        setProfileName(data.profileName || '');
        setFollowers(data.followers || '0');
        setTotalPosts(data.totalPosts || '0');
        setTotalViews(data.totalViews || '0');
        setFollowing(data.following || '0');
        setStep('verify');
      } else {
        const resJson = await response.json();
        throw new Error(resJson.error || 'Failed to analyze profile link.');
      }
    } catch (err) {
      setError(err.message || 'Connection failed. Verify server is online.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onConnect(platform, {
        profileUrl,
        accountId: scrapedData?.accountId,
        profileName,
        profilePicture: scrapedData?.profilePicture,
        followers: parseInt(followers) || 0,
        totalPosts: parseInt(totalPosts) || 0,
        totalViews: parseInt(totalViews) || 0,
        following: parseInt(following) || 0
      });
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to save account details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    if (platform && exampleUrls[platform]) {
      setProfileUrl(exampleUrls[platform].demo);
    }
  };

  const getBrandDetails = () => {
    switch (platform) {
      case 'YouTube':
        return { color: '#FF0000', icon: '🔴', title: 'Add YouTube Channel' };
      case 'Instagram':
        return { color: '#E1306C', icon: '📸', title: 'Add Instagram Account' };
      case 'Facebook':
        return { color: '#1877F2', icon: '🔵', title: 'Add Facebook Page' };
      case 'LinkedIn':
        return { color: '#0A66C2', icon: '💼', title: 'Add LinkedIn Page/Profile' };
      default:
        return { color: '#A67C52', icon: '🔗', title: 'Add Social Profile' };
    }
  };

  const brand = getBrandDetails();
  const urlSpec = platform ? exampleUrls[platform] : null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        {/* STEP 1: SELECT PLATFORM */}
        {step === 'select' && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={styles.title}>Track Social Profile</h3>
            <p style={styles.subtitle}>Choose a platform to monitor subscriber, posts, and engagement growth.</p>
            
            <div style={styles.platformGrid}>
              {[
                { id: 'YouTube', name: 'YouTube Channel', icon: '🔴', desc: 'Sync subscribers, video counts, and views' },
                { id: 'Instagram', name: 'Instagram Profile', icon: '📸', desc: 'Sync followers, posts, and details' }
              ].map((p) => (
                <button
                  key={p.id}
                  style={styles.platformBtn}
                  onClick={() => handleSelectPlatform(p.id)}
                  className="card"
                >
                  <span style={styles.platformIcon}>{p.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={styles.platformName}>{p.name}</h4>
                    <span style={styles.platformDesc}>{p.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: INPUT URL */}
        {step === 'inputUrl' && (
          <div>
            <div style={{ ...styles.header, borderBottomColor: brand.color }}>
              <span style={{ fontSize: '24px', marginRight: '8px' }}>{brand.icon}</span>
              <h3 style={styles.title}>{brand.title}</h3>
            </div>
            <p style={styles.subtitle}>Enter the URL of the public profile you wish to track. No passwords required.</p>

            {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

            <form onSubmit={handleFetchPreview} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Profile Link / URL</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder={urlSpec?.placeholder}
                  required
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  disabled={loading}
                />
                <span style={styles.inputTip}>{urlSpec?.tip}</span>
              </div>

              <div style={styles.demoBox}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Want a quick test?</span>
                <button
                  type="button"
                  style={styles.demoLink}
                  onClick={handleUseDemo}
                  disabled={loading}
                >
                  Click to use Demo URL
                </button>
              </div>

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep('select')}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: brand.color, borderColor: brand.color }}
                  disabled={loading}
                >
                  {loading ? 'Analyzing profile page...' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: CONFIRM & MANUAL FILL */}
        {step === 'verify' && (
          <div>
            <div style={{ ...styles.header, borderBottomColor: brand.color }}>
              <span style={{ fontSize: '24px', marginRight: '8px' }}>📝</span>
              <h3 style={styles.title}>Confirm Metrics</h3>
            </div>

            {scrapedData?.scrapedSuccess ? (
              <div style={styles.successAlert}>
                ✅ Profile fetched successfully! Please confirm or adjust details below:
              </div>
            ) : (
              <div style={styles.warningAlert}>
                ✍️ Security blocked automatic read. Please click the input boxes below and type your actual followers/posts manually:
              </div>
            )}

            {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

            <form onSubmit={handleConfirmLink} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Profile Name</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {platform === 'YouTube' ? 'Subscribers' : 'Followers'}
                </label>
                <input
                  type="number"
                  className="input-field"
                  required
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Total Posts / Videos</label>
                <input
                  type="number"
                  className="input-field"
                  required
                  value={totalPosts}
                  onChange={(e) => setTotalPosts(e.target.value)}
                  disabled={loading}
                />
              </div>

              {platform !== 'YouTube' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Following</label>
                  <input
                    type="number"
                    className="input-field"
                    required
                    value={following}
                    onChange={(e) => setFollowing(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {platform === 'YouTube' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Views</label>
                  <input
                    type="number"
                    className="input-field"
                    required
                    value={totalViews}
                    onChange={(e) => setTotalViews(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep('inputUrl')}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: brand.color, borderColor: brand.color }}
                  disabled={loading}
                >
                  {loading ? 'Connecting account...' : 'Confirm & Track'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={styles.successIcon}>🎉</div>
            <h3 style={styles.title}>Channel Connected!</h3>
            <p style={styles.successText}>
              The profile details have been verified. Growth charts and AI insights are now active on your dashboard.
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '24px' }}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
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
    maxWidth: '520px',
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
  header: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '2px solid',
    marginBottom: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-color)',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  platformGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  platformBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    cursor: 'pointer',
    width: '100%',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-color)',
    textAlign: 'left',
    transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
    ':hover': {
      transform: 'translateY(-2px)',
      borderColor: 'var(--primary-color)',
    }
  },
  platformIcon: {
    fontSize: '28px',
  },
  platformName: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-color)',
  },
  platformDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
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
  inputTip: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  demoBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'var(--bg-color)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    margin: '8px 0',
  },
  demoLink: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-color)',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    fontFamily: 'var(--font-family)',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  errorAlert: {
    padding: '12px 16px',
    backgroundColor: '#FDE8E8',
    color: '#E02424',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  successAlert: {
    padding: '12px 16px',
    backgroundColor: '#DEF7EC',
    color: '#03543F',
    borderRadius: 'var(--radius-md)',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  warningAlert: {
    padding: '12px 16px',
    backgroundColor: '#FEF08A',
    color: '#713F12',
    borderRadius: 'var(--radius-md)',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '16px',
    lineHeight: '1.4',
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  successText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '380px',
    margin: '0 auto',
  }
};
