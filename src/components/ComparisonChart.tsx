import { useMemo } from 'react';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import type { YearlyProjection, Destination, MonteCarloResult } from '@/types';
import { chartColors } from '@/styles/theme';
import { useTheme } from '@/state/ThemeContext';

interface Dataset {
  destination: Destination;
  projections: YearlyProjection[];
  monteCarlo?: MonteCarloResult;
}

interface ComparisonChartProps {
  datasets: Dataset[];
  dcProjections: YearlyProjection[];
}

const fmtAxis = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}K` : `$${n}`;

const fmtTooltip = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}K` : `$${n}`;

// Resolve CSS var to a hex color for recharts (which needs actual color values)
function resolveColor(cssVar: string): string {
  if (!cssVar.startsWith('var(')) return cssVar;
  const varName = cssVar.replace('var(', '').replace(')', '');
  const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return computed || '#888';
}

interface ChartRow {
  age: number;
  dcNetWorth: number;
  [key: string]: number | [number, number];
}

export default function ComparisonChart({ datasets, dcProjections }: ComparisonChartProps) {
  const { isLight } = useTheme();
  const colors = useMemo(() => chartColors(), [isLight]);
  const length = dcProjections.length;
  const hasMC = datasets.some((ds) => ds.monteCarlo);
  const data: ChartRow[] = [];

  for (let i = 0; i < length; i++) {
    const row: ChartRow = {
      age: dcProjections[i].age,
      dcNetWorth: dcProjections[i].totalNetWorth,
    };
    for (const ds of datasets) {
      if (ds.projections[i]) {
        row[ds.destination.id] = ds.monteCarlo
          ? (ds.monteCarlo.percentiles.p50[i] ?? ds.projections[i].totalNetWorth)
          : ds.projections[i].totalNetWorth;
      }
      if (ds.monteCarlo) {
        const mc = ds.monteCarlo;
        row[`${ds.destination.id}_p25_p75`] = [
          mc.percentiles.p25[i] ?? 0,
          mc.percentiles.p75[i] ?? 0,
        ];
      }
    }
    data.push(row);
  }

  const dcColor = resolveColor('var(--color-accent-dc)');

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        <XAxis
          dataKey="age"
          tick={{ fill: colors.tickFill, fontSize: 11, fontFamily: 'var(--font-mono)' }}
          axisLine={{ stroke: colors.axisStroke }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtAxis}
          tick={{ fill: colors.tickFill, fontSize: 11, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{
            background: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: colors.tooltipText,
          }}
          formatter={(value: number | [number, number], name: string) => {
            if (Array.isArray(value)) {
              const dsId = name.replace('_p25_p75', '');
              const dsName = datasets.find((d) => d.destination.id === dsId)?.destination.name ?? dsId;
              return [`${fmtTooltip(value[0])} - ${fmtTooltip(value[1])}`, `${dsName} P25-P75`];
            }
            const label = name === 'dcNetWorth'
              ? 'DC Baseline'
              : datasets.find((d) => d.destination.id === name)?.destination.name ?? name;
            return [fmtTooltip(value), label];
          }}
          labelFormatter={(age: number) => `Age ${age}`}
        />
        <Legend
          formatter={(value: string) => {
            if (value === 'dcNetWorth') return 'DC Baseline';
            if (value.endsWith('_p25_p75')) {
              const dsId = value.replace('_p25_p75', '');
              return `${datasets.find((d) => d.destination.id === dsId)?.destination.name ?? dsId} range`;
            }
            return datasets.find((d) => d.destination.id === value)?.destination.name ?? value;
          }}
          wrapperStyle={{ fontSize: '0.7rem', color: colors.labelFill }}
        />
        {/* MC p25-p75 bands — rendered behind lines */}
        {hasMC && datasets.map((ds) =>
          ds.monteCarlo ? (
            <Area
              key={`${ds.destination.id}_band`}
              type="monotone"
              dataKey={`${ds.destination.id}_p25_p75`}
              stroke="none"
              fill={resolveColor(ds.destination.accentColor)}
              fillOpacity={0.08}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          ) : null,
        )}
        {/* DC baseline — always dashed gold */}
        <Line
          type="monotone"
          dataKey="dcNetWorth"
          stroke={dcColor}
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
        />
        {/* Each selected destination */}
        {datasets.map((ds) => (
          <Line
            key={ds.destination.id}
            type="monotone"
            dataKey={ds.destination.id}
            stroke={resolveColor(ds.destination.accentColor)}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
