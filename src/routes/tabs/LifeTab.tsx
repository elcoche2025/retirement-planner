import { useScenario, useQoLWeights } from '@/state/hooks';
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

export default function LifeTab({ destinationId }: { destinationId: string }) {
  const { destination, effectiveQoL, config, setQoLRating, resetQoLRating } =
    useScenario(destinationId);
  const { weights } = useQoLWeights();

  const dc = getDestination('dc-baseline');
  const dcRatings = dc?.qolDefaults;

  if (!destination || !effectiveQoL) {
    return <div className="text-tertiary">Destination not found.</div>;
  }

  const qolScore = calculateQoLScore(effectiveQoL, weights);
  const customRatings = config?.customQoLRatings ?? {};

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
    </div>
  );
}
