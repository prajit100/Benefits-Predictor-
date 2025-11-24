import { HouseholdInput, AssessmentResults, ProgramResult } from '../types';
import { getFplPercentage } from './fpl';
import { evaluateSNAP } from './programs/snap';
import { evaluateMedicaid } from './programs/medicaid';
import { evaluateWIC } from './programs/wic';
import { evaluateTANF } from './programs/tanf';
import { evaluateEITC } from './programs/eitc';
import { evaluateHousing } from './programs/housing';

export const runAssessment = (input: HouseholdInput): AssessmentResults => {
  // 1. Basic Validation correction
  // Ensure numbers are valid (though UI should handle this)
  const cleanInput: HouseholdInput = {
    ...input,
    grossMonthlyIncome: Math.max(0, input.grossMonthlyIncome),
    householdSize: Math.max(1, input.householdSize),
  };

  // 2. Run Programs
  const programs: ProgramResult[] = [
    evaluateSNAP(cleanInput),
    evaluateMedicaid(cleanInput),
    evaluateWIC(cleanInput),
    evaluateTANF(cleanInput),
    evaluateEITC(cleanInput),
    evaluateHousing(cleanInput),
  ];

  // 3. Metadata
  const fplPercentage = getFplPercentage(cleanInput);

  return {
    timestamp: new Date().toISOString(),
    input: cleanInput,
    programs,
    fplPercentage
  };
};
