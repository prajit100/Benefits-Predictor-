import { HouseholdInput, ProgramResult, ImmigrationStatus } from '../../types';
import { getFplPercentage } from '../fpl';

export const evaluateTANF = (input: HouseholdInput): ProgramResult => {
  const fplPercent = getFplPercentage(input);
  const reasons: string[] = [];
  const keyFactors: string[] = [];
  
  let status: "likely_eligible" | "borderline" | "unlikely" = "unlikely";

  // 1. Must have children
  if (input.childrenCount === 0 && !input.isPregnant) {
    return {
      programId: 'tanf',
      programName: 'TANF (Cash Assistance)',
      status: "unlikely",
      reasons: ["TANF generally requires a minor child in the home or pregnancy."],
      keyFactors: ["No children under 18"],
      learnMoreUrl: 'https://www.acf.hhs.gov/ofa/programs/tanf'
    };
  }

  // 2. Income is VERY strict (often < 50% FPL)
  keyFactors.push(`Income is ~${Math.round(fplPercent)}% FPL`);

  // Immigration check (stricter than SNAP often)
  const isUndocumented = input.immigrationStatus === ImmigrationStatus.UNDOCUMENTED;
  if (isUndocumented) {
     status = "unlikely";
     reasons.push("Primary applicant status may disqualify the household, though citizen children might qualify for 'child-only' grants.");
  } else {
    if (fplPercent <= 50) {
      status = "likely_eligible";
      reasons.push("Your income is extremely low (<50% FPL), which is required for cash assistance in most states.");
    } else if (fplPercent <= 80) {
      status = "borderline";
      reasons.push("Income is very low, but TANF limits are often lower than 100% FPL. State rules vary significantly.");
    } else {
      status = "unlikely";
      reasons.push("TANF income limits are very strict (often well below the poverty line). Your income likely exceeds them.");
    }
  }

  return {
    programId: 'tanf',
    programName: 'TANF (Cash Assistance)',
    status,
    reasons,
    keyFactors,
    learnMoreUrl: 'https://www.acf.hhs.gov/ofa/programs/tanf'
  };
};
