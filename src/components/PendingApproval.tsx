import { useState, useEffect } from 'react';
import { signOut } from '@/services/auth';
import { getMyApproval } from '@/services/admin';
import './LoginScreen.css';

interface Props {
  onApproved: () => void;
}

export default function PendingApproval({ onApproved }: Props) {
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const approval = await getMyApproval();
      if (approval?.approved) {
        onApproved();
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [onApproved]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1 className="login-title">Life Change Planner</h1>
        <p className="login-subtitle">ACCOUNT PENDING APPROVAL</p>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 'var(--space-5)' }}>
          Your account has been created. An administrator will review and approve your access.
        </p>

        <button
          className="login-btn"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
