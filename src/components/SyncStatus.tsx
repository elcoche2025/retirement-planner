import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { signOut } from '@/services/auth';
import { useAppState } from '@/state/AppStateContext';
import { LogOut, RefreshCw } from 'lucide-react';
import './SyncStatus.css';

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return 'just now';
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SyncStatus() {
  const { state, syncStatus, syncNow } = useAppState();
  const [email, setEmail] = useState<string | null>(null);
  const [hasUser, setHasUser] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user.email ?? null);
      setHasUser(Boolean(session?.user.id));
    });
  }, []);

  async function handleSyncNow() {
    try {
      await syncNow();
    } catch {
      // Error is already captured in syncStatus
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  }

  const { syncing, error } = syncStatus;
  const dotClass = error
    ? 'sync-dot--error'
    : syncing
      ? 'sync-dot--syncing'
      : 'sync-dot--synced';

  const statusLabel = error
    ? 'Sync error'
    : syncing
      ? 'Syncing...'
      : 'Synced';

  return (
    <div className="sync-status">
      <div className="sync-status-info">
        {email && <span className="sync-email">{email}</span>}
        <span className="sync-timestamp">
          Last updated: {formatRelativeTime(state.localUpdatedAt)}
        </span>
        <span className="sync-indicator" title={error ?? undefined}>
          <span className={`sync-dot ${dotClass}`} />
          {statusLabel}
        </span>
      </div>
      <div className="sync-actions">
        <button
          className="sync-btn"
          onClick={handleSyncNow}
          disabled={syncing || !hasUser}
        >
          <RefreshCw size={14} />
          Sync Now
        </button>
        <button
          className="sync-btn sync-btn--signout"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LogOut size={14} />
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
