import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { YearlyProjection, Destination } from '@/types';
import { chartColors } from '@/styles/theme';
import { useTheme } from '@/state/ThemeContext';

interface Dataset {
  destination: Destination;
  projections: YearlyProjection[];
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
  [key: string]: number;
}

export default function ComparisonChart({ datasets, dcProjections }: ComparisonChartProps) {
  const { isLight } = useTheme();
  const colors = useMemo(() => chartColors(), [isLight]);
  const length = dcProjections.length;
  const data: ChartRow[] = [];

  for (let i = 0; i < length; i++) {
    const row: ChartRow = {
      age: dcProjections[i].age,
      dcNetWorth: dcProjections[i].totalNetWorth,
    };
    for (const ds of datasets) {
      if (ds.projections[i]) {
        row[ds.destination.id] = ds.projections[i].totalNetWorth;
      }
    }
    data.push(row);
  }

  const dcColor = resolveColor('var(--color-accent-dc)');

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
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
          formatter={(value: number, name: string) => {
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
            return datasets.find((d) => d.destination.id === value)?.destination.name ?? value;
          }}
          wrapperStyle={{ fontSize: '0.7rem', color: colors.labelFill }}
        />
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
      </LineChart>
    </ResponsiveContainer>
  );
}
