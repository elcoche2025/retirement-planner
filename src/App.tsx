import { useState, useEffect, useCallback } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import { AppStateProvider } from './state/AppStateContext';
import { ThemeProvider } from './state/ThemeContext';
import { ensureApprovalRow, type UserApproval } from './services/admin';
import LoginScreen from './components/LoginScreen';
import PendingApproval from './components/PendingApproval';
import Layout from './components/Layout';
import Dashboard from './routes/Dashboard';
import ScenarioDetail from './routes/ScenarioDetail';
import Compare from './routes/Compare';
import Matrix from './routes/Matrix';
import Plan from './routes/Plan';
import Inputs from './routes/Inputs';
import Report from './routes/Report';
import Admin from './routes/Admin';

function AppRouter({ session, isAdmin }: { session: Session; isAdmin: boolean }) {
  return (
    <AppStateProvider userId={session.user.id}>
      <HashRouter>
        <Routes>
          <Route element={<Layout isAdmin={isAdmin} />}>
            <Route index element={<Dashboard />} />
            <Route path="scenario/:id/*" element={<ScenarioDetail />} />
            <Route path="compare" element={<Compare />} />
            <Route path="matrix" element={<Matrix />} />
            <Route path="plan" element={<Plan />} />
            <Route path="inputs" element={<Inputs />} />
            <Route path="report" element={<Report />} />
            {isAdmin && <Route path="admin" element={<Admin />} />}
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [approval, setApproval] = useState<UserApproval | null>(null);
  const [approvalChecked, setApprovalChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setApproval(null);
        setApprovalChecked(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check approval status when session is available
  useEffect(() => {
    if (!session) return;
    setApprovalChecked(false);
    ensureApprovalRow(session.user.id, session.user.email ?? '')
      .then((row) => {
        setApproval(row);
        setApprovalChecked(true);
      })
      .catch(() => {
        setApprovalChecked(true);
      });
  }, [session]);

  const handleApproved = useCallback(() => {
    if (!session) return;
    ensureApprovalRow(session.user.id, session.user.email ?? '')
      .then((row) => setApproval(row))
      .catch(() => {});
  }, [session]);

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

  // Still checking approval status
  if (!approvalChecked) {
    return (
      <ThemeProvider>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="text-tertiary">Loading...</p>
        </div>
      </ThemeProvider>
    );
  }

  // Not approved yet — show pending screen
  if (!approval?.approved) {
    return (
      <ThemeProvider>
        <PendingApproval onApproved={handleApproved} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppRouter session={session} isAdmin={approval.is_admin} />
    </ThemeProvider>
  );
}
