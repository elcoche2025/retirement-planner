import { useState, useRef, useEffect, useCallback } from 'react';
import { User, Plus, Pencil, Trash2, Check, X, ChevronDown } from 'lucide-react';
import { useProfiles } from '@/state/hooks';
import './ProfileSwitcher.css';

export default function ProfileSwitcher() {
  const { profiles, activeProfile, switchProfile, addProfile, renameProfile, deleteProfile } =
    useProfiles();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addName, setAddName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDropdown();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Focus add input when it appears
  useEffect(() => {
    if (adding) addInputRef.current?.focus();
  }, [adding]);

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setAdding(false);
    setAddName('');
    setRenamingId(null);
    setRenameValue('');
  }, []);

  function handleSwitch(id: string) {
    switchProfile(id);
    closeDropdown();
  }

  function handleStartAdd() {
    setAdding(true);
    setAddName('');
    setRenamingId(null);
  }

  function handleConfirmAdd() {
    const trimmed = addName.trim();
    if (!trimmed) return;
    addProfile(trimmed);
    closeDropdown();
  }

  function handleStartRename(id: string, currentName: string) {
    setRenamingId(id);
    setRenameValue(currentName);
    setAdding(false);
  }

  function handleConfirmRename() {
    if (!renamingId) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    renameProfile(renamingId, trimmed);
    setRenamingId(null);
    setRenameValue('');
  }

  function handleDelete(id: string) {
    deleteProfile(id);
  }

  const isLastProfile = profiles.length <= 1;

  return (
    <div className="profile-switcher" ref={containerRef}>
      <button
        className="profile-switcher-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <User size={14} strokeWidth={1.5} />
        <span>{activeProfile?.name ?? 'Profile'}</span>
        <ChevronDown size={12} strokeWidth={1.5} className={open ? 'chevron-open' : ''} />
      </button>

      {open && (
        <div className="profile-switcher-dropdown" role="listbox">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`profile-row ${profile.id === activeProfile?.id ? 'profile-row-active' : ''}`}
            >
              {renamingId === profile.id ? (
                <div className="profile-rename-row">
                  <input
                    ref={renameInputRef}
                    className="profile-inline-input"
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmRename();
                      if (e.key === 'Escape') {
                        setRenamingId(null);
                        setRenameValue('');
                      }
                    }}
                  />
                  <button
                    className="profile-icon-btn"
                    onClick={handleConfirmRename}
                    aria-label="Confirm rename"
                  >
                    <Check size={13} strokeWidth={2} />
                  </button>
                  <button
                    className="profile-icon-btn"
                    onClick={() => {
                      setRenamingId(null);
                      setRenameValue('');
                    }}
                    aria-label="Cancel rename"
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="profile-name-btn"
                    onClick={() => handleSwitch(profile.id)}
                    role="option"
                    aria-selected={profile.id === activeProfile?.id}
                  >
                    {profile.id === activeProfile?.id && (
                      <Check size={13} strokeWidth={2} className="profile-check" />
                    )}
                    <span>{profile.name}</span>
                  </button>
                  <div className="profile-row-actions">
                    <button
                      className="profile-icon-btn"
                      onClick={() => handleStartRename(profile.id, profile.name)}
                      aria-label={`Rename ${profile.name}`}
                    >
                      <Pencil size={12} strokeWidth={1.5} />
                    </button>
                    <button
                      className="profile-icon-btn"
                      onClick={() => handleDelete(profile.id)}
                      disabled={isLastProfile}
                      aria-label={`Delete ${profile.name}`}
                    >
                      <Trash2 size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="profile-add-section">
            {adding ? (
              <div className="profile-add-row">
                <input
                  ref={addInputRef}
                  className="profile-inline-input"
                  type="text"
                  placeholder="Profile name"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmAdd();
                    if (e.key === 'Escape') {
                      setAdding(false);
                      setAddName('');
                    }
                  }}
                />
                <button
                  className="profile-icon-btn"
                  onClick={handleConfirmAdd}
                  aria-label="Confirm add"
                >
                  <Check size={13} strokeWidth={2} />
                </button>
                <button
                  className="profile-icon-btn"
                  onClick={() => {
                    setAdding(false);
                    setAddName('');
                  }}
                  aria-label="Cancel add"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button className="profile-add-btn" onClick={handleStartAdd}>
                <Plus size={13} strokeWidth={2} />
                <span>Add Profile</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
