import { HouseholdInput, ProgramResult } from '../../types';
import { getFplPercentage } from '../fpl';

export const evaluateWIC = (input: HouseholdInput): ProgramResult => {
  const fplPercent = getFplPercentage(input);
  const reasons: string[] = [];
  const keyFactors: string[] = [];
  
  let status: "likely_eligible" | "borderline" | "unlikely" = "unlikely";

  // Categorical Requirement
  const isCategoricallyEligible = input.isPregnant || input.childrenUnder5Count > 0;

  if (!isCategoricallyEligible) {
    reasons.push("WIC is specifically for pregnant/postpartum individuals and children under 5.");
    return {
      programId: 'wic',
      programName: 'WIC',
      status: "unlikely",
      reasons,
      keyFactors: ["No pregnant members or children under 5 reported"],
      learnMoreUrl: 'https://www.fns.usda.gov/wic'
    };
  }

  keyFactors.push(`Income is ~${Math.round(fplPercent)}% FPL`);

  // Income Threshold: 185% FPL
  if (fplPercent <= 185) {
    status = "likely_eligible";
    reasons.push("Your income is at or below 185% of the poverty level, which meets the WIC financial standard.");
  } else if (fplPercent <= 220) {
    status = "borderline";
    reasons.push("Your income is slightly above the 185% cutoff, but pregnancy counts as a larger household size in some interpretations, or specific deductions may apply.");
  } else {
    status = "unlikely";
    reasons.push("Income appears to exceed the 185% FPL limit for WIC.");
  }

  return {
    programId: 'wic',
    programName: 'WIC (Women, Infants, & Children)',
    status,
    reasons,
    keyFactors,
    learnMoreUrl: 'https://www.fns.usda.gov/wic'
  };
};
