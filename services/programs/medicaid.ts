import { HouseholdInput, ProgramResult } from '../../types';
import { getFplPercentage } from '../fpl';
import { MEDICAID_EXPANSION_STATES } from '../../constants';

export const evaluateMedicaid = (input: HouseholdInput): ProgramResult => {
  const fplPercent = getFplPercentage(input);
  const reasons: string[] = [];
  const keyFactors: string[] = [];
  
  let status: "likely_eligible" | "borderline" | "unlikely" = "unlikely";

  const isExpansionState = MEDICAID_EXPANSION_STATES.includes(input.state);
  const hasChildren = input.childrenCount > 0;
  const isPregnant = input.isPregnant;
  const isElderlyOrDisabled = input.elderlyCount > 0 || input.hasDisability;

  keyFactors.push(`Income is ~${Math.round(fplPercent)}% FPL`);

  // 1. Children & Pregnancy (CHIP/Medicaid for Moms) - Higher limits
  if (hasChildren || isPregnant) {
    const threshold = 200; // Conservative CHIP/Pregnancy threshold (some states go to 300%+)
    if (fplPercent <= threshold) {
      status = "likely_eligible";
      reasons.push("Households with children or pregnant members typically have higher income limits (often 200%+ FPL).");
    } else if (fplPercent <= 300) {
      status = "borderline";
      reasons.push("Income is relatively high, but CHIP programs in some states cover children up to 300% FPL or higher.");
    } else {
      status = "unlikely";
      reasons.push("Income likely exceeds CHIP/Medicaid limits, but check state marketplace for subsidies.");
    }
  }
  // 2. Adults (Non-pregnant, 19-64)
  else if (!isElderlyOrDisabled) {
    if (isExpansionState) {
      if (fplPercent <= 138) {
        status = "likely_eligible";
        reasons.push(`${input.state} is an expansion state. Adults with income under 138% FPL are typically eligible.`);
      } else if (fplPercent <= 150) {
        status = "borderline";
        reasons.push("You are slightly over the 138% limit, but deductions might bring you under.");
      } else {
        status = "unlikely";
        reasons.push("Income exceeds the 138% FPL expansion limit.");
      }
    } else {
      // Non-expansion state
      status = "unlikely";
      reasons.push(`${input.state} has not expanded Medicaid. Eligibility for non-disabled adults without children is very limited.`);
      if (fplPercent < 100) {
        keyFactors.push("Coverage Gap risk");
        reasons.push("You may fall into the 'Coverage Gap' where you earn too little for Marketplace subsidies but don't qualify for Medicaid.");
      }
    }
  } 
  // 3. Elderly / Disabled
  else {
    // Simplified logic for ABD (Aged, Blind, Disabled) Medicaid
    if (fplPercent <= 100) {
      status = "likely_eligible";
      reasons.push("Income is within typical limits for Aged/Disabled Medicaid programs.");
    } else {
      status = "borderline";
      reasons.push("Income is over 100% FPL, but 'Spend Down' programs or Savings Programs (MSP) might help.");
    }
  }

  return {
    programId: 'medicaid',
    programName: 'Medicaid & CHIP',
    status,
    reasons,
    keyFactors,
    learnMoreUrl: 'https://www.medicaid.gov/'
  };
};
