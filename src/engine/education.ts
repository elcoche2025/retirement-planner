import type { Destination, CareerPreset } from '@/types';

export function getEducationCost(
  destination: Destination,
  career: CareerPreset,
  daughterAge: number,
): number {
  // Too young for any care
  if (daughterAge < destination.educationSystem.preschoolAge) {
    return 0;
  }

  // Preschool/childcare age (before primary school)
  if (daughterAge < destination.educationSystem.primaryAge) {
    return destination.childcareMonthly * 12;
  }

  // School age — check for tuition waiver
  const hasTuitionWaiver = career.benefits.some(
    (b) => b.toLowerCase().includes('tuition waiver') || b.toLowerCase().includes('tuition discount'),
  );
  if (hasTuitionWaiver) {
    return 0;
  }

  // Free public school available and viable
  if (destination.publicSchoolFree) {
    return 0;
  }

  // Must pay for international school
  return destination.costOfLiving.internationalSchoolAnnual;
}
