import { useScenario } from '@/state/hooks';
import './VisaTab.css';

export default function VisaTab({ destinationId }: { destinationId: string }) {
  const { destination } = useScenario(destinationId);

  if (!destination) {
    return <div className="text-tertiary">Destination not found.</div>;
  }

  const isDC = destinationId === 'dc-baseline';
  const { visa } = destination;

  if (isDC) {
    return (
      <div className="visa-tab">
        <div className="visa-no-visa card">
          <div className="visa-no-visa-icon">&#10003;</div>
          <h3>No Visa Needed</h3>
          <p className="text-secondary">
            As US citizens, you have full work and residency rights in Washington, DC.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="visa-tab">
      {/* Visa overview */}
      <section className="visa-overview card">
        <h3 className="section-title">Visa Details</h3>
        <div className="visa-detail-grid">
          <div className="visa-detail-item">
            <span className="visa-detail-label">Visa Type</span>
            <span className="visa-detail-value">{visa.type}</span>
          </div>
          <div className="visa-detail-item">
            <span className="visa-detail-label">Duration</span>
            <span className="visa-detail-value">{visa.duration}</span>
          </div>
          <div className="visa-detail-item">
            <span className="visa-detail-label">Processing Time</span>
            <span className="visa-detail-value">{visa.processingTime}</span>
          </div>
          <div className="visa-detail-item">
            <span className="visa-detail-label">Costs</span>
            <span className="visa-detail-value mono">{visa.costs}</span>
          </div>
          <div className="visa-detail-item">
            <span className="visa-detail-label">Renewal</span>
            <span className="visa-detail-value">{visa.renewalProcess}</span>
          </div>
          <div className="visa-detail-item">
            <span className="visa-detail-label">Path to PR</span>
            <span className="visa-detail-value">{visa.pathToPR}</span>
          </div>
        </div>
      </section>

      {/* Work rights */}
      <section className="visa-work card">
        <h3 className="section-title">Work Rights</h3>
        <div className="visa-work-grid">
          <div className="visa-work-item">
            <span className="visa-work-label">Your Work Rights</span>
            <span className="visa-work-value">{visa.workRights}</span>
          </div>
          <div className="visa-work-item">
            <span className="visa-work-label">Spouse Work Rights</span>
            <span className="visa-work-value">{visa.spouseWorkRights}</span>
          </div>
        </div>
      </section>

      {/* Requirements checklist */}
      {visa.requirements.length > 0 && visa.requirements[0] !== 'N/A' && (
        <section className="visa-requirements card">
          <h3 className="section-title">Requirements</h3>
          <ul className="visa-checklist">
            {visa.requirements.map((req) => (
              <li key={req} className="visa-checklist-item">
                <span className="visa-checkbox" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Gotchas */}
      {visa.gotchas.length > 0 && (
        <section className="visa-gotchas">
          <h3 className="section-title">Watch Out</h3>
          <div className="visa-gotchas-list">
            {visa.gotchas.map((gotcha) => (
              <div key={gotcha} className="visa-gotcha-item">
                <span className="visa-gotcha-icon">!</span>
                <span>{gotcha}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
