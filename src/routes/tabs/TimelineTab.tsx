import { useState } from 'react';
import { useScenario, useGlobalAssumptions } from '@/state/hooks';
import SliderInput from '@/components/SliderInput';
import './TimelineTab.css';

interface Milestone {
  year: number;
  label: string;
  type: 'now' | 'move' | 'child' | 'return' | 'retire';
}

const DECISION_CHECKLIST = [
  'Visa application submitted',
  'DC home decision finalized',
  'Job / income secured',
  'Housing in destination secured',
  'School enrollment confirmed',
  'Health insurance arranged',
  'Financial advisor consulted',
];

export default function TimelineTab({ destinationId }: { destinationId: string }) {
  const { destination, config, update } = useScenario(destinationId);
  const { globals } = useGlobalAssumptions();
  const [checks, setChecks] = useState<Record<number, boolean>>({});

  if (!destination) {
    return <div className="text-tertiary">Destination not found.</div>;
  }

  const moveYear = config?.moveYear ?? globals.moveYear;
  const returnYear = config?.returnYear ?? null;
  const hasReturn = returnYear !== null;
  const currentYear = 2026;
  const retirementYear = currentYear + (globals.retirementAge - globals.currentAge);

  // Daughter: born ~2023, starts school at ~5, middle school at ~11
  const daughterBirthYear = 2023;
  const schoolStartYear = daughterBirthYear + 5;
  const middleSchoolYear = daughterBirthYear + 11;

  // Build milestones
  const milestones: Milestone[] = [
    { year: currentYear, label: 'Now', type: 'now' },
    { year: moveYear, label: `Move to ${destination.city}`, type: 'move' },
  ];

  if (schoolStartYear >= currentYear && schoolStartYear <= retirementYear + 2) {
    milestones.push({ year: schoolStartYear, label: 'Daughter starts school', type: 'child' });
  }

  if (middleSchoolYear >= currentYear && middleSchoolYear <= retirementYear + 2) {
    milestones.push({ year: middleSchoolYear, label: 'Daughter middle school', type: 'child' });
  }

  if (hasReturn && returnYear) {
    milestones.push({ year: returnYear, label: 'Return to DC', type: 'return' });
  }

  milestones.push({ year: retirementYear, label: 'Retirement', type: 'retire' });

  // Sort and deduplicate by year
  milestones.sort((a, b) => a.year - b.year);

  const minYear = milestones[0].year;
  const maxYear = milestones[milestones.length - 1].year;
  const range = maxYear - minYear || 1;

  const handleReturnToggle = () => {
    if (hasReturn) {
      update({ returnYear: null });
    } else {
      update({ returnYear: moveYear + 5 });
    }
  };

  const handleCheck = (idx: number) => {
    setChecks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="timeline-tab">
      {/* Move year slider */}
      <section className="card timeline-controls">
        <h3 className="section-title">Timeline Settings</h3>
        <div className="timeline-sliders">
          <SliderInput
            label="Move Year"
            value={moveYear}
            onChange={(v) => update({ moveYear: v })}
            min={2026}
            max={2032}
            step={1}
          />

          <div className="timeline-return-toggle">
            <label className="timeline-checkbox-label">
              <input
                type="checkbox"
                checked={hasReturn}
                onChange={handleReturnToggle}
                className="timeline-checkbox"
              />
              <span>Plan to return to DC</span>
            </label>
          </div>

          {hasReturn && returnYear && (
            <SliderInput
              label="Return Year"
              value={returnYear}
              onChange={(v) => update({ returnYear: v })}
              min={moveYear + 2}
              max={moveYear + 15}
              step={1}
            />
          )}
        </div>
      </section>

      {/* Visual timeline */}
      <section className="card timeline-visual-section">
        <h3 className="section-title">Life Timeline</h3>
        <div className="timeline-track-container">
          <div className="timeline-track">
            {milestones.map((m, i) => {
              const pct = ((m.year - minYear) / range) * 100;
              return (
                <div
                  key={`${m.year}-${m.type}-${i}`}
                  className={`timeline-milestone timeline-milestone-${m.type}`}
                  style={{ left: `${pct}%` }}
                >
                  <div className="timeline-dot" />
                  <div className="timeline-label">
                    <span className="timeline-label-year mono">{m.year}</span>
                    <span className="timeline-label-text">{m.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Decision gate checklist */}
      <section className="card timeline-checklist-section">
        <h3 className="section-title">Decision Gate Checklist</h3>
        <p className="timeline-checklist-intro text-secondary">
          Key steps to complete before your move to {destination.name}.
        </p>
        <ul className="timeline-checklist">
          {DECISION_CHECKLIST.map((item, idx) => (
            <li key={item} className="timeline-checklist-item">
              <label className="timeline-checklist-label">
                <input
                  type="checkbox"
                  checked={!!checks[idx]}
                  onChange={() => handleCheck(idx)}
                  className="timeline-checklist-checkbox"
                />
                <span className={checks[idx] ? 'timeline-checked' : ''}>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
