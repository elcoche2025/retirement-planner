import { Link } from 'react-router-dom';
import type { Destination, YearlyProjection } from '@/types';
import './DestinationCard.css';

interface DestinationCardProps {
  destination: Destination;
  projections: YearlyProjection[];
  careerPresetName: string;
  qolScore: number | undefined;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="destination-card-sparkline"
      aria-hidden="true"
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ stroke: color }}
      />
      <polyline
        points={`${pad},${h} ${points.join(' ')} ${w - pad},${h}`}
        fillOpacity="0.08"
        stroke="none"
        style={{ fill: color }}
      />
    </svg>
  );
}

const fmt = (n: number) =>
  n >= 1e6
    ? `$${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
      ? `$${(n / 1e3).toFixed(0)}K`
      : `$${n}`;

export default function DestinationCard({
  destination,
  projections,
  careerPresetName,
  qolScore,
}: DestinationCardProps) {
  const lastProjection = projections[projections.length - 1];
  const netWorthAtRetirement = lastProjection?.totalNetWorth ?? 0;
  const sparklineData = projections.map((p) => p.totalNetWorth);
  const accentColor = destination.accentColor;

  return (
    <Link
      to={`/scenario/${destination.id}`}
      className="destination-card card"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      <div className="destination-card-header">
        <span className="destination-card-flag">{destination.flag}</span>
        <span className="destination-card-name">{destination.name}</span>
        {destination.researchDepth === 'shallow' && (
          <span className="badge badge-shallow">Estimates</span>
        )}
      </div>

      <div className="destination-card-body">
        <div className="destination-card-stats">
          <div className="destination-card-stat">
            <span className="destination-card-stat-value mono">{fmt(netWorthAtRetirement)}</span>
            <span className="destination-card-stat-label">Net Worth at Retirement</span>
          </div>
          {qolScore !== undefined && (
            <div className="destination-card-stat">
              <span className="destination-card-stat-value mono">{qolScore.toFixed(0)}</span>
              <span className="destination-card-stat-label">QoL Score</span>
            </div>
          )}
        </div>

        <MiniSparkline data={sparklineData} color={accentColor} />
      </div>

      <div className="destination-card-footer">
        <span className="destination-card-career">{careerPresetName}</span>
      </div>
    </Link>
  );
}
