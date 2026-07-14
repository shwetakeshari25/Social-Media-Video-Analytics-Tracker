import React, { useState } from 'react';
import { API_BASE_URL } from '../../config.js';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Store Token
      localStorage.setItem('video_tracker_token', data.token);
      
      // Notify Parent App
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="card animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🎬</div>
          <h2 style={styles.title}>Video Analytics Tracker</h2>
          <p style={styles.subtitle}>
            {isLogin
              ? 'Log in to track analytics & generate AI scripts'
              : 'Create an account to begin tracking'}
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" style={styles.spinner}></span>
            ) : isLogin ? (
              'Log In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={styles.toggleContainer}>
          <span style={styles.toggleText}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            type="button"
            style={styles.toggleBtn}
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={loading}
          >
            {isLogin ? 'Register' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 30px rgba(62, 49, 37, 0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logo: {
    fontSize: '44px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  error: {
    backgroundColor: '#FAF0EE',
    color: 'var(--error-color)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
    borderLeft: '4px solid var(--error-color)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
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
  submitBtn: {
    width: '100%',
    padding: '14px',
    marginTop: '10px',
    fontSize: '15px',
  },
  spinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 253, 251, 0.3)',
    borderTopColor: '#FFFDFB',
    borderRadius: '50%',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '24px',
    fontSize: '13px',
  },
  toggleText: {
    color: 'var(--text-secondary)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-color)',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-family)',
    textDecoration: 'underline',
  },
};
