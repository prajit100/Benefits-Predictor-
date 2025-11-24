import { HouseholdInput, ProgramResult, ImmigrationStatus } from '../../types';
import { getFplPercentage } from '../fpl';

export const evaluateSNAP = (input: HouseholdInput): ProgramResult => {
  const fplPercent = getFplPercentage(input);
  const reasons: string[] = [];
  const keyFactors: string[] = [];
  
  let status: "likely_eligible" | "borderline" | "unlikely" = "unlikely";

  // Citizenship Check
  const validImmigration = [
    ImmigrationStatus.CITIZEN,
    ImmigrationStatus.LPR_5_PLUS,
    ImmigrationStatus.OTHER_DOCUMENTED // Oversimplification, but good for general screening
  ].includes(input.immigrationStatus);

  if (!validImmigration) {
    reasons.push("Primary applicant's immigration status may limit eligibility, though other household members (like citizen children) might still qualify.");
    keyFactors.push("Immigration Status Check");
    // We don't hard fail here because mixed status households exist, but we mark borderline at best if income is low
  }

  // Income Thresholds
  // Generally 130% Gross FPL
  const grossLimit = 130;
  const borderlineLimit = 185; // Some states have broad based categorical eligibility up to 200%, keeping safe margin.

  // Senior/Disabled special rules often allow higher net income or asset tests, simplistic check here:
  const hasVulnerable = input.elderlyCount > 0 || input.hasDisability;
  const effectiveGrossLimit = hasVulnerable ? 165 : grossLimit;

  keyFactors.push(`Household income is ~${Math.round(fplPercent)}% of FPL`);

  if (fplPercent <= effectiveGrossLimit) {
    if (validImmigration) {
      status = "likely_eligible";
      reasons.push("Your gross income is within the typical federal limit (130% FPL) or your state's expanded limit.");
    } else {
      status = "borderline";
      reasons.push("Income levels look eligible, but eligibility depends on specific immigration details for each member.");
    }
  } else if (fplPercent <= borderlineLimit) {
    status = "borderline";
    reasons.push("Your income is above the standard 130% federal limit but might qualify under state-specific 'Categorical Eligibility' rules which can go up to 200% FPL in some areas.");
  } else {
    status = "unlikely";
    reasons.push("Gross income appears to exceed standard and expanded limits for SNAP.");
  }

  return {
    programId: 'snap',
    programName: 'SNAP (Food Stamps)',
    status,
    reasons,
    keyFactors,
    learnMoreUrl: 'https://www.fns.usda.gov/snap/recipient/eligibility'
  };
};
