import type { Destination } from '@/types';

import { dcBaseline } from './dc-baseline';
import { kenyaNairobi } from './kenya-nairobi';
import { nlTheHague } from './nl-the-hague';
import { nlAmsterdam } from './nl-amsterdam';
import { spainBilbao } from './spain-bilbao';
import { spainBarcelona } from './spain-barcelona';
import { spainMadrid } from './spain-madrid';
import { spainValencia } from './spain-valencia';
import { mexicoCdmx } from './mexico-cdmx';
import { mexicoOaxaca } from './mexico-oaxaca';
import { colombiaMedellin } from './colombia-medellin';
import { uruguayMontevideo } from './uruguay-montevideo';

export {
  dcBaseline,
  kenyaNairobi,
  nlTheHague,
  nlAmsterdam,
  spainBilbao,
  spainBarcelona,
  spainMadrid,
  spainValencia,
  mexicoCdmx,
  mexicoOaxaca,
  colombiaMedellin,
  uruguayMontevideo,
};

export const ALL_DESTINATIONS: Destination[] = [
  dcBaseline,
  kenyaNairobi,
  nlTheHague,
  nlAmsterdam,
  spainBilbao,
  spainBarcelona,
  spainMadrid,
  spainValencia,
  mexicoCdmx,
  mexicoOaxaca,
  colombiaMedellin,
  uruguayMontevideo,
];

export function getDestination(id: string): Destination | undefined {
  return ALL_DESTINATIONS.find((d) => d.id === id);
}
