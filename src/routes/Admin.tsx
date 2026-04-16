import { useState, useEffect, useCallback } from 'react';
import {
  getAllApprovals,
  approveUser,
  revokeUser,
  deleteUserApproval,
  type UserApproval,
} from '@/services/admin';
import { supabase } from '@/services/supabase';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState<UserApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    fetchUsers();
  }, [fetchUsers]);

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
