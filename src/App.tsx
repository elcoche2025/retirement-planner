import { useState, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './styles/gate.css';

const HASH = '78163a9b32a43d0bf9bf5a80cd700105ddd6e3abe279bb190fa9b97f05c59e77';

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  async function tryAuth() {
    const hash = await sha256(pw);
    if (hash === HASH) {
      sessionStorage.setItem('planner-auth', 'true');
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="gate">
      <div className={`gate-box ${shake ? 'shake' : ''}`}>
        <h1 className="gate-title">Life Change Planner</h1>
        <p className="gate-subtitle">CHART YOUR NEXT HORIZON</p>
        <input
          className={`gate-input ${error ? 'error' : ''}`}
          type="password"
          placeholder="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') tryAuth(); }}
          autoFocus
        />
        <button className="gate-btn" onClick={tryAuth}>Enter</button>
        {error && <p className="gate-error">incorrect</p>}
      </div>
    </div>
  );
}

function PlaceholderApp() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="page-enter" style={{ padding: 48, textAlign: 'center' }}>
            <h1>Life Change Planner</h1>
            <p className="text-secondary" style={{ marginTop: 12 }}>Dashboard coming soon</p>
          </div>
        } />
      </Routes>
    </HashRouter>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('planner-auth') === 'true') {
      setAuthed(true);
    }
  }, []);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;
  return <PlaceholderApp />;
}
