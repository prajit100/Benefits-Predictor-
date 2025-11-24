import { HouseholdInput } from '../types';

// 2024 Poverty Guidelines (Approximate for educational use)
const BASE_POVERTY_CONTIGUOUS = 15060;
const PER_PERSON_CONTIGUOUS = 5380;

const BASE_POVERTY_ALASKA = 18810;
const PER_PERSON_ALASKA = 6730;

const BASE_POVERTY_HAWAII = 17310;
const PER_PERSON_HAWAII = 6190;

export const calculateMonthlyFPL = (householdSize: number, state: string): number => {
  let base = BASE_POVERTY_CONTIGUOUS;
  let perPerson = PER_PERSON_CONTIGUOUS;

  if (state === 'AK') {
    base = BASE_POVERTY_ALASKA;
    perPerson = PER_PERSON_ALASKA;
  } else if (state === 'HI') {
    base = BASE_POVERTY_HAWAII;
    perPerson = PER_PERSON_HAWAII;
  }

  // Formula: Base + (Size - 1) * PerPerson
  const annualFPL = base + (Math.max(1, householdSize) - 1) * perPerson;
  return annualFPL / 12;
};

export const getFplPercentage = (input: HouseholdInput): number => {
  const fpl100 = calculateMonthlyFPL(input.householdSize, input.state);
  if (fpl100 === 0) return 0;
  return (input.grossMonthlyIncome / fpl100) * 100;
};
