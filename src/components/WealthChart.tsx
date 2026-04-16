import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { YearlyProjection } from '@/types';
import { chartColors } from '@/styles/theme';
import { useTheme } from '@/state/ThemeContext';

interface WealthChartProps {
  projections: YearlyProjection[];
  dcProjections?: YearlyProjection[];
  accentColor: string;
  currentYear?: number;
}

const fmtAxis = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}K` : `$${n}`;

const fmtTooltip = (n: number) =>
  n >= 1e6
    ? `$${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
      ? `$${(n / 1e3).toFixed(0)}K`
      : `$${n}`;

interface ChartRow {
  age: number;
  year: number;
  netWorth: number;
  dcNetWorth?: number;
}

export default function WealthChart({
  projections,
  dcProjections,
  accentColor,
  currentYear,
}: WealthChartProps) {
  const { isLight } = useTheme();
  const colors = useMemo(() => chartColors(), [isLight]);
  const data: ChartRow[] = projections.map((p, i) => ({
    age: p.age,
    year: p.year,
    netWorth: p.totalNetWorth,
    dcNetWorth: dcProjections?.[i]?.totalNetWorth,
  }));

  const nowAge = currentYear
    ? data.find((d) => d.year >= currentYear)?.age
    : undefined;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity={0.15} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
          formatter={(value: number, name: string) => [
            fmtTooltip(value),
            name === 'dcNetWorth' ? 'DC Baseline' : 'Net Worth',
          ]}
          labelFormatter={(age: number) => `Age ${age}`}
        />
        {nowAge !== undefined && (
          <ReferenceLine
            x={nowAge}
            stroke={colors.refLineStroke}
            strokeDasharray="4 4"
            label={{
              value: 'Now',
              position: 'top',
              fill: colors.refLineStroke,
              fontSize: 10,
            }}
          />
        )}
        {dcProjections && (
          <Area
            type="monotone"
            dataKey="dcNetWorth"
            stroke={colors.accentDc}
            strokeWidth={1.5}
            strokeDasharray="6 3"
            fill="none"
            dot={false}
          />
        )}
        <Area
          type="monotone"
          dataKey="netWorth"
          stroke={accentColor}
          strokeWidth={2}
          fill="url(#areaFill)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
