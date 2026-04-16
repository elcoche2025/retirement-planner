import { useScenario } from '@/state/hooks';
import ToggleGroup from '@/components/ToggleGroup';
import type { ToggleOption } from '@/components/ToggleGroup';
import './CareerTab.css';

const fmtK = (n: number) => `$${(n / 1000).toFixed(0)}K`;

export default function CareerTab({ destinationId }: { destinationId: string }) {
  const { destination, config, update, selectedPreset } = useScenario(destinationId);

  if (!destination) {
    return <div className="text-tertiary">Destination not found.</div>;
  }

  const options: ToggleOption[] = destination.careerPresets.map((preset) => ({
    id: preset.id,
    label: preset.name,
    sublabel: fmtK(preset.householdAnnualIncome) + '/yr combined',
    content: (
      <div className="career-preset-detail">
        <p className="career-preset-description">{preset.description}</p>
        <div className="career-preset-roles">
          <span className="career-preset-role">
            <strong>You:</strong> {preset.yourRole} ({fmtK(preset.yourAnnualIncome)})
          </span>
          <span className="career-preset-role">
            <strong>Kara:</strong> {preset.karaRole} ({fmtK(preset.karaAnnualIncome)})
          </span>
        </div>
        {preset.benefits.length > 0 && (
          <div className="career-preset-benefits">
            {preset.benefits.map((b) => (
              <span key={b} className="badge">{b}</span>
            ))}
          </div>
        )}
        {!preset.visaCompatible && (
          <div className="career-preset-warning">
            Visa compatibility issue - may not be eligible for work under this visa type
          </div>
        )}
        {preset.notes.length > 0 && (
          <div className="career-preset-notes">
            {preset.notes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        )}
      </div>
    ),
  }));

  const handleChange = (presetId: string) => {
    update({ selectedCareerPreset: presetId });
  };

  return (
    <div className="career-tab">
      <h3 className="section-title">Career Scenario</h3>
      <p className="career-tab-intro text-secondary">
        Select a career configuration for {destination.name}. Financial projections
        update automatically.
      </p>

      <ToggleGroup
        options={options}
        selected={config?.selectedCareerPreset ?? destination.careerPresets[0]?.id ?? ''}
        onChange={handleChange}
        accentColor={destination.accentColor}
      />

      {selectedPreset && (
        <div className="career-tab-summary card">
          <h4>Current Selection: {selectedPreset.name}</h4>
          <div className="career-tab-summary-grid">
            <div className="metric-card">
              <div className="value" style={{ color: destination.accentColor }}>
                {fmtK(selectedPreset.householdAnnualIncome)}
              </div>
              <div className="label">Household Income</div>
            </div>
            <div className="metric-card">
              <div className="value">{fmtK(selectedPreset.benefitsMonetaryValue)}</div>
              <div className="label">Benefits Value</div>
            </div>
            <div className="metric-card">
              <div className="value">{selectedPreset.incomeGrowthRate}%</div>
              <div className="label">Annual Growth</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
