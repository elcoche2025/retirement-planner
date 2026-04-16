import { useState } from 'react';
import { ALL_DESTINATIONS, getDestination } from '@/data/destinations';
import './Plan.css';

interface Phase {
  id: number;
  title: string;
  subtitle: string;
  items: string[];
}

const BASE_PHASES: Phase[] = [
  {
    id: 0,
    title: 'Phase 0: Research & Decision',
    subtitle: 'Narrow your options and commit',
    items: [
      'Narrow to 2-3 finalist destinations',
      'Share matrix results with Kara',
      'Consult cross-border tax specialist',
      'Visit top destinations (scouting trip)',
    ],
  },
  {
    id: 1,
    title: 'Phase 1: Preparation',
    subtitle: '6-12 months before move',
    items: [
      'Begin Roth conversion in low-income year',
      'Engage immigration attorney',
      'List DC home / find property manager',
      'Start international school applications',
    ],
  },
  {
    id: 2,
    title: 'Phase 2: Transition',
    subtitle: 'Final 1-2 months',
    items: [
      'Ship belongings',
      'Close / transfer DC accounts',
      'Activate international health insurance',
      'Final DC home handoff',
    ],
  },
  {
    id: 3,
    title: 'Phase 3: Settling',
    subtitle: 'First 6 months abroad',
    items: [
      'Register with local government',
      'Open local bank account',
      'Enroll in healthcare system',
      'Start school / daycare enrollment',
      'Set up business (if self-employed path)',
    ],
  },
  {
    id: 4,
    title: 'Phase 4: Evaluation',
    subtitle: '6-month check-in',
    items: [
      '6-month financial check-in',
      'Family happiness assessment',
      'Career trajectory review',
      'Go / stay / adjust decision',
    ],
  },
];

export default function Plan() {
  const [selectedId, setSelectedId] = useState(ALL_DESTINATIONS[0]?.id ?? '');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const destination = getDestination(selectedId);

  // Build phases with destination-specific visa requirements injected into Phase 1
  const phases = BASE_PHASES.map((phase) => {
    if (phase.id === 1 && destination && destination.id !== 'dc-baseline') {
      const visaItems = destination.visa.requirements
        .filter((r) => r !== 'N/A')
        .map((r) => `Visa: ${r}`);
      return {
        ...phase,
        items: [...phase.items, ...visaItems],
      };
    }
    return phase;
  });

  const toggleExpanded = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheck = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-enter plan-page">
      <h1>Move Plan</h1>
      <p className="text-secondary plan-subtitle">
        A phased checklist for your international move. Select a destination to customize.
      </p>

      {/* Destination selector */}
      <div className="plan-selector">
        <label className="plan-selector-label" htmlFor="plan-dest">
          Planning for
        </label>
        <select
          id="plan-dest"
          className="plan-selector-dropdown"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {ALL_DESTINATIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.flag} {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Phase timeline dots */}
      <div className="plan-timeline-dots">
        {phases.map((phase, i) => (
          <div key={phase.id} className="plan-dot-group">
            <button
              type="button"
              className={`plan-dot${expanded[phase.id] ? ' plan-dot-active' : ''}`}
              onClick={() => toggleExpanded(phase.id)}
            >
              {phase.id}
            </button>
            {i < phases.length - 1 && <div className="plan-dot-connector" />}
          </div>
        ))}
      </div>

      {/* Phase cards */}
      <div className="plan-phases">
        {phases.map((phase) => {
          const isOpen = expanded[phase.id] ?? false;
          return (
            <div key={phase.id} className={`plan-phase card${isOpen ? ' plan-phase-open' : ''}`}>
              <button
                type="button"
                className="plan-phase-header"
                onClick={() => toggleExpanded(phase.id)}
              >
                <div className="plan-phase-header-left">
                  <span className="plan-phase-number mono">{phase.id}</span>
                  <div>
                    <div className="plan-phase-title">{phase.title}</div>
                    <div className="plan-phase-subtitle text-tertiary">{phase.subtitle}</div>
                  </div>
                </div>
                <span className={`plan-phase-chevron${isOpen ? ' plan-phase-chevron-open' : ''}`}>
                  &#9662;
                </span>
              </button>

              {isOpen && (
                <ul className="plan-phase-items">
                  {phase.items.map((item) => {
                    const key = `${phase.id}-${item}`;
                    const checked = !!checks[key];
                    return (
                      <li key={key} className="plan-phase-item">
                        <label className="plan-phase-item-label">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCheck(key)}
                            className="plan-phase-checkbox"
                          />
                          <span className={checked ? 'plan-item-checked' : ''}>{item}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
