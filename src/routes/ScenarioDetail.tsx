import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { useScenario } from '@/state/hooks';
import TabNav from '@/components/TabNav';
import FinancialsTab from './tabs/FinancialsTab';
import './ScenarioDetail.css';

export default function ScenarioDetail() {
  const { id } = useParams<{ id: string }>();
  const { destination } = useScenario(id ?? '');

  if (!destination) {
    return (
      <div className="page-enter">
        <p className="text-tertiary">Destination not found.</p>
      </div>
    );
  }

  const basePath = `/scenario/${destination.id}`;
  const tabs = [
    { to: `${basePath}/financials`, label: 'Financials' },
    { to: `${basePath}/career`, label: 'Career' },
    { to: `${basePath}/housing`, label: 'Housing' },
    { to: `${basePath}/life`, label: 'Life' },
    { to: `${basePath}/visa`, label: 'Visa' },
    { to: `${basePath}/timeline`, label: 'Timeline' },
  ];

  return (
    <div className="page-enter scenario-detail">
      {/* Header */}
      <header
        className="scenario-detail-header"
        style={{ '--accent': destination.accentColor } as React.CSSProperties}
      >
        <div className="scenario-detail-title-row">
          <span className="scenario-detail-flag">{destination.flag}</span>
          <h1 className="scenario-detail-name">{destination.name}</h1>
          {destination.researchDepth === 'shallow' && (
            <span className="badge badge-shallow">Estimates Only</span>
          )}
        </div>
        <p className="scenario-detail-narrative">{destination.narrative}</p>
      </header>

      {/* Tab navigation */}
      <TabNav tabs={tabs} />

      {/* Sub-tab content */}
      <div className="scenario-detail-content">
        <Routes>
          <Route index element={<Navigate to="financials" replace />} />
          <Route path="financials" element={<FinancialsTab destinationId={destination.id} />} />
          <Route path="career" element={<div className="text-tertiary">Career tab coming soon.</div>} />
          <Route path="housing" element={<div className="text-tertiary">Housing tab coming soon.</div>} />
          <Route path="life" element={<div className="text-tertiary">Life tab coming soon.</div>} />
          <Route path="visa" element={<div className="text-tertiary">Visa tab coming soon.</div>} />
          <Route path="timeline" element={<div className="text-tertiary">Timeline tab coming soon.</div>} />
        </Routes>
      </div>
    </div>
  );
}
