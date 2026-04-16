import { useState, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './state/AppStateContext';
import { ThemeProvider } from './state/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './routes/Dashboard';
import ScenarioDetail from './routes/ScenarioDetail';
import Compare from './routes/Compare';
import Matrix from './routes/Matrix';
import Plan from './routes/Plan';
import Inputs from './routes/Inputs';
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

function AppRouter() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="scenario/:id/*" element={<ScenarioDetail />} />
            <Route path="compare" element={<Compare />} />
            <Route path="matrix" element={<Matrix />} />
            <Route path="plan" element={<Plan />} />
            <Route path="inputs" element={<Inputs />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('planner-auth') === 'true') {
      setAuthed(true);
    }
  }, []);

  if (!authed) {
    return (
      <ThemeProvider>
        <PasswordGate onAuth={() => setAuthed(true)} />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}
