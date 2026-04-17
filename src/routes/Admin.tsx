import { useState, useEffect, useCallback } from 'react';
import {
  getAllApprovals,
  approveUser,
  revokeUser,
  deleteUserApproval,
  type UserApproval,
} from '@/services/admin';
import { getSignupsEnabled, setSignupsEnabled } from '@/services/appConfig';
import { supabase } from '@/services/supabase';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState<UserApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [signupsOn, setSignupsOn] = useState(true);
  const [signupToggleBusy, setSignupToggleBusy] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAllApprovals();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
    getSignupsEnabled().then(setSignupsOn);
    fetchUsers();
  }, [fetchUsers]);

  async function handleToggleSignups() {
    const next = !signupsOn;
    setSignupToggleBusy(true);
    try {
      await setSignupsEnabled(next);
      setSignupsOn(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle signups');
    } finally {
      setSignupToggleBusy(false);
    }
  }

  async function handleApprove(userId: string) {
    setBusy(userId);
    try {
      await approveUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setBusy(null);
    }
  }

  async function handleRevoke(userId: string) {
    setBusy(userId);
    try {
      await revokeUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke user');
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(userId: string) {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    setBusy(userId);
    try {
      await deleteUserApproval(userId);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <h1>User Management</h1>
        <p className="admin-empty">Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>User Management</h1>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-signups-toggle">
        <div className="admin-signups-toggle-info">
          <div className="admin-signups-toggle-label">
            New signups: <strong>{signupsOn ? 'enabled' : 'disabled'}</strong>
          </div>
          <div className="admin-signups-toggle-desc">
            {signupsOn
              ? 'Anyone can create an account and is auto-approved. You get an email on each signup.'
              : 'Signup form is hidden. Any forced API signups land unapproved (no cloud sync) and do not trigger email notifications.'}
          </div>
        </div>
        <button
          className={`admin-btn admin-btn--${signupsOn ? 'revoke' : 'approve'}`}
          disabled={signupToggleBusy}
          onClick={handleToggleSignups}
        >
          {signupToggleBusy
            ? 'Working...'
            : signupsOn
              ? 'Disable new signups'
              : 'Enable new signups'}
        </button>
      </div>

      <div className="admin-signups-supabase-note">
        <strong>Need a hard cutoff at the auth layer?</strong> The toggle above
        is app-level — it hides the signup UI and locks out forced API signups,
        but the Supabase signup endpoint still accepts requests. To have Supabase
        itself reject all signups, turn off "Allow new users to sign up" on the
        Email provider:{' '}
        <a
          href="https://supabase.com/dashboard/project/misjzqiqihdzzajaoyro/auth/providers"
          target="_blank"
          rel="noopener noreferrer"
        >
          Supabase → Authentication → Providers → Email
        </a>
        .
      </div>

      {users.length === 0 ? (
        <p className="admin-empty">No users found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.user_id === currentUserId;
              const isWorking = busy === u.user_id;

              return (
                <tr key={u.user_id}>
                  <td data-label="Email">
                    <span className="admin-email">
                      {u.email ?? u.user_id.slice(0, 8) + '...'}
                    </span>
                    {u.is_admin && (
                      <span className="admin-badge admin-badge--admin">Admin</span>
                    )}
                  </td>
                  <td data-label="Status">
                    <span
                      className={`admin-badge ${
                        u.approved ? 'admin-badge--approved' : 'admin-badge--pending'
                      }`}
                    >
                      {u.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td data-label="Joined">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td data-label="Actions">
                    <div className="admin-actions">
                      {!u.approved && (
                        <button
                          className="admin-btn admin-btn--approve"
                          disabled={isWorking}
                          onClick={() => handleApprove(u.user_id)}
                        >
                          Approve
                        </button>
                      )}
                      {u.approved && !isSelf && (
                        <button
                          className="admin-btn admin-btn--revoke"
                          disabled={isWorking}
                          onClick={() => handleRevoke(u.user_id)}
                        >
                          Revoke
                        </button>
                      )}
                      {!isSelf && (
                        <button
                          className="admin-btn admin-btn--delete"
                          disabled={isWorking}
                          onClick={() => handleDelete(u.user_id)}
                        >
                          Delete
                        </button>
                      )}
                      {isSelf && (
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.7rem' }}>
                          (you)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
