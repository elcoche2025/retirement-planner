interface MetricCardProps {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}

export default function MetricCard({ label, value, color, sub }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="value" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="label">{label}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
