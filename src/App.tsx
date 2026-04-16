import { useState, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import { AppStateProvider } from './state/AppStateContext';
import { ThemeProvider } from './state/ThemeContext';
import LoginScreen from './components/LoginScreen';
import Layout from './components/Layout';
import Dashboard from './routes/Dashboard';
import ScenarioDetail from './routes/ScenarioDetail';
import Compare from './routes/Compare';
import Matrix from './routes/Matrix';
import Plan from './routes/Plan';
import Inputs from './routes/Inputs';
import Report from './routes/Report';
import Admin from './routes/Admin';

function AppRouter({ session }: { session: Session }) {
  return (
    <AppStateProvider userId={session.user.id}>
      <HashRouter>
        <Routes>
          <Route element={<Layout isAdmin={true} />}>
            <Route index element={<Dashboard />} />
            <Route path="scenario/:id/*" element={<ScenarioDetail />} />
            <Route path="compare" element={<Compare />} />
            <Route path="matrix" element={<Matrix />} />
            <Route path="plan" element={<Plan />} />
            <Route path="inputs" element={<Inputs />} />
            <Route path="report" element={<Report />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <ThemeProvider>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="text-tertiary">Loading...</p>
        </div>
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <ThemeProvider>
        <LoginScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppRouter session={session} />
    </ThemeProvider>
  );
}
