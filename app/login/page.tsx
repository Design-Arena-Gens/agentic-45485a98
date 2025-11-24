'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      Cookies.set('token', data.token, { expires: 7 });

      // Simulate loading delay like Google
      setTimeout(() => {
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/player/dashboard');
        }
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>⚽</div>
          <h1 style={styles.title}>Football ERP</h1>
          <p style={styles.subtitle}>Sign in to continue</p>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="google-loader">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p style={styles.loadingText}>Signing you in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.button}>
              Sign in
            </button>

            <div style={styles.hint}>
              <p style={styles.hintText}>Default Admin Login:</p>
              <p style={styles.hintText}>Username: admin | Password: admin123</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#5f6368',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px 0',
  },
  loadingText: {
    marginTop: '24px',
    color: '#5f6368',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '14px 16px',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.2s',
  },
  button: {
    padding: '14px 24px',
    background: '#1a73e8',
    color: 'white',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    marginTop: '8px',
    transition: 'all 0.2s',
  },
  error: {
    padding: '12px 16px',
    background: '#fce8e6',
    color: '#c5221f',
    borderRadius: '8px',
    fontSize: '14px',
  },
  hint: {
    marginTop: '16px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    textAlign: 'center',
  },
  hintText: {
    fontSize: '12px',
    color: '#5f6368',
    margin: '4px 0',
  },
};
