import { HouseholdInput, ProgramResult } from '../../types';
import { getFplPercentage } from '../fpl';

export const evaluateHousing = (input: HouseholdInput): ProgramResult => {
  const fplPercent = getFplPercentage(input);
  const reasons: string[] = [];
  const keyFactors: string[] = [];
  
  let status: "likely_eligible" | "borderline" | "unlikely" = "unlikely";

  keyFactors.push(`Income is ~${Math.round(fplPercent)}% FPL`);

  // HUD uses AMI (Area Median Income), not FPL.
  // But FPL is a decent proxy for "Very Low Income" in many areas.
  // 50% FPL is definitely "Very Low". 
  // 80% FPL is definitely "Low".
  
  // NOTE: Housing is strictly supply-limited. "Eligible" != "Will Receive".

  if (fplPercent <= 50) {
    status = "likely_eligible";
    reasons.push("Your income is very low (<50% poverty), placing you in a priority group for housing vouchers or public housing.");
    reasons.push("However, waitlists are often years long. Apply immediately.");
  } else if (fplPercent <= 80) {
    status = "borderline";
    reasons.push("You likely fall within the 'Low Income' limits for HUD programs, but priority is often given to those with even lower income.");
  } else {
    status = "unlikely";
    reasons.push("While you might qualify for some affordable housing units, you likely exceed income limits for deep-subsidy voucher programs.");
  }

  return {
    programId: 'housing',
    programName: 'Housing Assistance (Section 8/Public Housing)',
    status,
    reasons,
    keyFactors,
    learnMoreUrl: 'https://www.hud.gov/topics/housing_choice_voucher_program_section_8'
  };
};
