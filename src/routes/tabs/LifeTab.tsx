import { useScenario, useQoLWeights, useGlobalAssumptions } from '@/state/hooks';
import { getDestination } from '@/data/destinations';
import { QOL_DIMENSION_META } from '@/data/qol-dimensions';
import { calculateQoLScore } from '@/engine/scoring';
import RadarChart from '@/components/RadarChart';
import SliderInput from '@/components/SliderInput';
import type { QoLDimension } from '@/types';
import {
  Heart,
  GraduationCap,
  Languages,
  Stethoscope,
  Shield,
  Sun,
  Globe,
  Briefcase,
  Users,
  Landmark,
  Compass,
  ArrowLeftRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './LifeTab.css';

const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  GraduationCap,
  Languages,
  Stethoscope,
  Shield,
  Sun,
  Globe,
  Briefcase,
  Users,
  Landmark,
  Compass,
  ArrowLeftRight,
};

function getTransitionAssessment(ageAtMove: number): { label: string; className: string } {
  if (ageAtMove <= 5) return { label: 'Ideal -- full immersion', className: 'edu-risk-ideal' };
  if (ageAtMove <= 9) return { label: 'Good -- adapts quickly', className: 'edu-risk-good' };
  if (ageAtMove <= 12) return { label: 'Moderate -- may need international school', className: 'edu-risk-moderate' };
  return { label: 'Difficult -- international school recommended', className: 'edu-risk-difficult' };
}

const fmtCost = (n: number) =>
  n === 0 ? 'Free' : `$${n.toLocaleString('en-US')}/yr`;

const fmtChildcare = (n: number) =>
  `$${n.toLocaleString('en-US')}/mo`;

export default function LifeTab({ destinationId }: { destinationId: string }) {
  const { destination, effectiveQoL, config, setQoLRating, resetQoLRating } =
    useScenario(destinationId);
  const { weights } = useQoLWeights();
  const { globals } = useGlobalAssumptions();

  const dc = getDestination('dc-baseline');
  const dcRatings = dc?.qolDefaults;

  if (!destination || !effectiveQoL) {
    return <div className="text-tertiary">Destination not found.</div>;
  }

  const qolScore = calculateQoLScore(effectiveQoL, weights);
  const customRatings = config?.customQoLRatings ?? {};

  // Education comparison data
  const edu = destination.educationSystem;
  const dcEdu = dc?.educationSystem;
  const moveYear = config?.moveYear ?? globals.moveYear;
  const currentYear = 2026;
  const yearsUntilMove = moveYear - currentYear;
  const ageAtMove = globals.daughterAge + yearsUntilMove;
  const transition = getTransitionAssessment(ageAtMove);
  const annualSchoolCost = destination.publicSchoolFree
    ? 0
    : destination.costOfLiving.internationalSchoolAnnual;

  return (
    <div className="life-tab">
      {/* Score header */}
      <div className="life-score-header">
        <div className="life-score-number" style={{ color: destination.accentColor }}>
          {qolScore.toFixed(1)}
        </div>
        <div className="life-score-label">Life Score</div>
      </div>

      {/* Radar chart */}
      <div className="life-radar-section">
        <RadarChart
          ratings={effectiveQoL}
          dcRatings={dcRatings}
          accentColor={destination.accentColor}
        />
        <div className="life-radar-legend">
          <span className="life-radar-legend-item">
            <span
              className="life-radar-legend-swatch"
              style={{ background: destination.accentColor }}
            />
            {destination.name}
          </span>
          <span className="life-radar-legend-item">
            <span
              className="life-radar-legend-swatch"
              style={{ background: 'var(--color-accent-dc)' }}
            />
            DC Baseline
          </span>
        </div>
      </div>

      {/* Dimension cards */}
      <div className="life-dimensions-grid">
        {QOL_DIMENSION_META.map((meta) => {
          const dim = meta.id as QoLDimension;
          const Icon = ICON_MAP[meta.icon];
          const isOverridden = dim in customRatings;
          const defaultVal = destination.qolDefaults[dim];
          const currentVal = effectiveQoL[dim];

          return (
            <div key={dim} className="life-dimension-card">
              <div className="life-dimension-header">
                {Icon && <Icon size={16} className="life-dimension-icon" />}
                <span className="life-dimension-label">{meta.label}</span>
              </div>

              <SliderInput
                label=""
                value={currentVal}
                onChange={(v) => setQoLRating(dim, v)}
                min={1}
                max={10}
                step={1}
              />

              {isOverridden && (
                <div className="life-dimension-override">
                  <span className="life-dimension-override-text">
                    You: {currentVal} | Default: {defaultVal}
                  </span>
                  <button
                    className="life-dimension-reset"
                    onClick={() => resetQoLRating(dim)}
                  >
                    Reset
                  </button>
                </div>
              )}

              <div className="life-dimension-description">{meta.description}</div>
            </div>
          );
        })}
      </div>

      {/* Education Path comparison */}
      <section className="life-education-section">
        <h3 className="section-title">Education Path</h3>
        <div className="life-education-grid">
          {/* This destination */}
          <div className="life-education-card">
            <div className="life-education-card-header" style={{ color: destination.accentColor }}>
              {destination.flag} {destination.name}
            </div>
            <div className="life-education-rows">
              <div className="life-education-row">
                <span className="life-education-row-label">System</span>
                <span className="life-education-row-value">{edu.systemName}</span>
              </div>
              <div className="life-education-row">
                <span className="life-education-row-label">Language</span>
                <span className="life-education-row-value">{edu.languageOfInstruction}</span>
              </div>
              <div className="life-education-row">
                <span className="life-education-row-label">Curriculum</span>
                <span className="life-education-row-value">{edu.curriculumType}</span>
              </div>
              {edu.internationalSchoolOptions.length > 0 && (
                <div className="life-education-row">
                  <span className="life-education-row-label">International</span>
                  <span className="life-education-row-value">
                    {edu.internationalSchoolOptions.join(', ')}
                  </span>
                </div>
              )}
              <div className="life-education-row">
                <span className="life-education-row-label">Annual Cost</span>
                <span className="life-education-row-value">{fmtCost(annualSchoolCost)}</span>
              </div>
              <div className="life-education-row">
                <span className="life-education-row-label">Childcare</span>
                <span className="life-education-row-value">{fmtChildcare(destination.childcareMonthly)}</span>
              </div>
            </div>
          </div>

          {/* DC baseline */}
          {dc && dcEdu && (
            <div className="life-education-card">
              <div className="life-education-card-header" style={{ color: 'var(--color-accent-dc)' }}>
                {dc.flag} DC Baseline
              </div>
              <div className="life-education-rows">
                <div className="life-education-row">
                  <span className="life-education-row-label">System</span>
                  <span className="life-education-row-value">{dcEdu.systemName}</span>
                </div>
                <div className="life-education-row">
                  <span className="life-education-row-label">Language</span>
                  <span className="life-education-row-value">{dcEdu.languageOfInstruction}</span>
                </div>
                <div className="life-education-row">
                  <span className="life-education-row-label">Curriculum</span>
                  <span className="life-education-row-value">{dcEdu.curriculumType}</span>
                </div>
                <div className="life-education-row">
                  <span className="life-education-row-label">Annual Cost</span>
                  <span className="life-education-row-value">{dc.publicSchoolFree ? 'Free' : fmtCost(dc.costOfLiving.internationalSchoolAnnual)}</span>
                </div>
                <div className="life-education-row">
                  <span className="life-education-row-label">Childcare</span>
                  <span className="life-education-row-value">{fmtChildcare(dc.childcareMonthly)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transition risk assessment */}
        <div className="life-education-transition">
          <div className="life-education-transition-header">
            Transition Assessment
            <span className="life-education-transition-age mono">
              (daughter age {ageAtMove} at move)
            </span>
          </div>
          <div className={`life-education-transition-badge ${transition.className}`}>
            {transition.label}
          </div>
          {edu.transitionNotes.length > 0 && (
            <ul className="life-education-notes">
              {edu.transitionNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
