import { useMemo } from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { QualityOfLifeRatings, QoLDimension } from '@/types';
import { QOL_DIMENSIONS } from '@/types';
import { chartColors } from '@/styles/theme';
import { useTheme } from '@/state/ThemeContext';

const SHORT_LABELS: Record<QoLDimension, string> = {
  familyProximity: 'Family',
  childEducation: 'Education',
  languageEnvironment: 'Language',
  healthcareQuality: 'Health',
  safety: 'Safety',
  climate: 'Climate',
  culturalFit: 'Culture',
  careerSatisfaction: 'Career',
  communityBuilding: 'Community',
  politicalStability: 'Stability',
  adventureNovelty: 'Adventure',
  returnFlexibility: 'Flexibility',
};

interface RadarChartProps {
  ratings: QualityOfLifeRatings;
  dcRatings?: QualityOfLifeRatings;
  accentColor: string;
}

function resolveColor(cssVar: string): string {
  if (!cssVar.startsWith('var(')) return cssVar;
  const varName = cssVar.replace('var(', '').replace(')', '');
  const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return computed || '#888';
}

export default function RadarChart({ ratings, dcRatings, accentColor }: RadarChartProps) {
  const { isLight } = useTheme();
  const colors = useMemo(() => chartColors(), [isLight]);
  const data = QOL_DIMENSIONS.map((dim) => ({
    dimension: SHORT_LABELS[dim],
    value: ratings[dim],
    dc: dcRatings ? dcRatings[dim] : undefined,
  }));

  const resolvedAccent = resolveColor(accentColor);
  const resolvedDc = colors.accentDc;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke={colors.gridStroke} />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: colors.labelFill, fontSize: 11, fontFamily: 'var(--font-body)' }}
        />
        <PolarRadiusAxis
          domain={[0, 10]}
          tick={{ fill: colors.tickFill, fontSize: 9 }}
          axisLine={false}
          tickCount={6}
        />
        {dcRatings && (
          <Radar
            name="DC Baseline"
            dataKey="dc"
            stroke={resolvedDc}
            fill={resolvedDc}
            fillOpacity={0.15}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}
        <Radar
          name="This Destination"
          dataKey="value"
          stroke={resolvedAccent}
          fill={resolvedAccent}
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
