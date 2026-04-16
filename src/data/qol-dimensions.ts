import type { QoLDimensionMeta } from '@/types';

export const QOL_DIMENSION_META: QoLDimensionMeta[] = [
  {
    id: 'familyProximity',
    label: 'Family Proximity',
    description: 'Distance and travel time to parents in Nanyuki, Kenya',
    icon: 'Heart',
  },
  {
    id: 'childEducation',
    label: 'Child Education',
    description: 'Quality and availability of schooling options for daughter',
    icon: 'GraduationCap',
  },
  {
    id: 'languageEnvironment',
    label: 'Language Environment',
    description: 'Bilingual and multilingual exposure for the family',
    icon: 'Languages',
  },
  {
    id: 'healthcareQuality',
    label: 'Healthcare Quality',
    description: 'Access to quality healthcare and specialist services',
    icon: 'Stethoscope',
  },
  {
    id: 'safety',
    label: 'Safety',
    description: 'Personal and family safety in daily life',
    icon: 'Shield',
  },
  {
    id: 'climate',
    label: 'Climate',
    description: 'Weather and climate comfort year-round',
    icon: 'Sun',
  },
  {
    id: 'culturalFit',
    label: 'Cultural Fit',
    description: 'Alignment with family values, lifestyle, and cultural richness',
    icon: 'Globe',
  },
  {
    id: 'careerSatisfaction',
    label: 'Career Satisfaction',
    description: 'Professional growth opportunities and job market strength',
    icon: 'Briefcase',
  },
  {
    id: 'communityBuilding',
    label: 'Community Building',
    description: 'Ease of making friends and building a social network',
    icon: 'Users',
  },
  {
    id: 'politicalStability',
    label: 'Political Stability',
    description: 'Government stability and rule of law',
    icon: 'Landmark',
  },
  {
    id: 'adventureNovelty',
    label: 'Adventure & Novelty',
    description: 'Sense of exploration, discovery, and new experiences',
    icon: 'Compass',
  },
  {
    id: 'returnFlexibility',
    label: 'Return Flexibility',
    description: 'Ease of returning to the US if the move does not work out',
    icon: 'ArrowLeftRight',
  },
];
