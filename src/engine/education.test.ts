import { describe, it, expect } from 'vitest';
import { getEducationCost } from './education';
import { getDestination } from '@/data/destinations';

describe('getEducationCost', () => {
  it('returns 0 for DC baseline (free public school)', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const cost = getEducationCost(dc, career, 6); // age 6, in school
    expect(cost).toBe(0);
  });

  it('returns childcare cost for pre-school age', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    // DC preschoolAge=3, primaryAge=5 — age 3 is in childcare range
    const cost = getEducationCost(dc, career, 3);
    expect(cost).toBe(dc.childcareMonthly * 12);
  });

  it('returns 0 when career has tuition waiver and child is school age', () => {
    const hague = getDestination('nl-the-hague')!;
    const tuitionWaiverCareer = {
      ...hague.careerPresets[0],
      benefits: ['Tuition waiver for daughter'],
    };
    const cost = getEducationCost(hague, tuitionWaiverCareer, 7);
    expect(cost).toBe(0);
  });

  it('returns international school cost when public school not viable', () => {
    const kenya = getDestination('kenya-nairobi')!;
    // Use a preset without tuition discount — 'kenya-both-remote' has no tuition waiver
    const career = kenya.careerPresets.find(p => p.id === 'kenya-both-remote')!;
    expect(career).toBeDefined();
    const cost = getEducationCost(kenya, career, 8); // school age, no free public, no waiver
    expect(cost).toBe(kenya.costOfLiving.internationalSchoolAnnual);
  });

  it('returns 0 for free public school destinations at school age without waiver', () => {
    const hague = getDestination('nl-the-hague')!;
    // Use a preset WITHOUT tuition waiver
    const noWaiverPreset = hague.careerPresets.find(p => !p.benefits.some(b => b.toLowerCase().includes('tuition waiver')));
    if (noWaiverPreset) {
      const cost = getEducationCost(hague, noWaiverPreset, 7);
      expect(cost).toBe(0); // free Dutch basisschool
    }
  });

  it('returns 0 for infant (below preschool age)', () => {
    const kenya = getDestination('kenya-nairobi')!;
    const career = kenya.careerPresets[0];
    const cost = getEducationCost(kenya, career, 1);
    expect(cost).toBe(0);
  });
});
