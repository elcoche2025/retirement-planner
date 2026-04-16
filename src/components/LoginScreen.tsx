import { useState, type FormEvent } from 'react';
import { signIn, signUp } from '@/services/auth';
import './LoginScreen.css';

export default function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError('');
    setConfirmPassword('');
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1 className="login-title">Life Change Planner</h1>
        <p className="login-subtitle">
          {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {mode === 'signup' && (
            <input
              className="login-input"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}

        <p className="login-toggle">
          {mode === 'signin' ? (
            <>
              Need an account?{' '}
              <button type="button" onClick={toggleMode}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={toggleMode}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
