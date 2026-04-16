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
import type { YearlyProjection, MonteCarloResult } from '@/types';
import { chartColors } from '@/styles/theme';
import { useTheme } from '@/state/ThemeContext';

interface WealthChartProps {
  projections: YearlyProjection[];
  dcProjections?: YearlyProjection[];
  accentColor: string;
  currentYear?: number;
  monteCarlo?: MonteCarloResult;
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
  p10_p90?: [number, number];
  p25_p75?: [number, number];
}

export default function WealthChart({
  projections,
  dcProjections,
  accentColor,
  currentYear,
  monteCarlo,
}: WealthChartProps) {
  const { isLight } = useTheme();
  const colors = useMemo(() => chartColors(), [isLight]);

  const data: ChartRow[] = projections.map((p, i) => {
    const row: ChartRow = {
      age: p.age,
      year: p.year,
      netWorth: monteCarlo ? (monteCarlo.percentiles.p50[i] ?? p.totalNetWorth) : p.totalNetWorth,
      dcNetWorth: dcProjections?.[i]?.totalNetWorth,
    };
    if (monteCarlo) {
      row.p10_p90 = [monteCarlo.percentiles.p10[i] ?? 0, monteCarlo.percentiles.p90[i] ?? 0];
      row.p25_p75 = [monteCarlo.percentiles.p25[i] ?? 0, monteCarlo.percentiles.p75[i] ?? 0];
    }
    return row;
  });

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
          formatter={(value: number | [number, number], name: string) => {
            if (Array.isArray(value)) {
              return [
                `${fmtTooltip(value[0])} - ${fmtTooltip(value[1])}`,
                name === 'p10_p90' ? 'P10-P90 Range' : 'P25-P75 Range',
              ];
            }
            return [
              fmtTooltip(value),
              name === 'dcNetWorth' ? 'DC Baseline' : monteCarlo ? 'Median Net Worth' : 'Net Worth',
            ];
          }}
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
        {/* Monte Carlo bands — rendered behind the main line */}
        {monteCarlo && (
          <>
            <Area
              type="monotone"
              dataKey="p10_p90"
              stroke="none"
              fill={accentColor}
              fillOpacity={0.05}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="p25_p75"
              stroke="none"
              fill={accentColor}
              fillOpacity={0.12}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </>
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
          fill={monteCarlo ? 'none' : 'url(#areaFill)'}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
