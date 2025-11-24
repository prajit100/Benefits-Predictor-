import { HouseholdInput, ProgramResult, TaxFilingStatus, ImmigrationStatus } from '../../types';

export const evaluateEITC = (input: HouseholdInput): ProgramResult => {
  const reasons: string[] = [];
  const keyFactors: string[] = [];
  
  let status: "likely_eligible" | "borderline" | "unlikely" = "unlikely";

  // 1. Must have earned income
  if (!input.hasEarnedIncome || input.monthlyEarnedIncome <= 0) {
    return {
      programId: 'eitc',
      programName: 'EITC (Tax Credit)',
      status: "unlikely",
      reasons: ["You must have earned income from employment or self-employment to claim EITC."],
      keyFactors: ["No earned income reported"],
      learnMoreUrl: 'https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit'
    };
  }

  // 2. SSN Requirement (Roughly map to immigration status)
  if (input.immigrationStatus === ImmigrationStatus.UNDOCUMENTED) {
    return {
      programId: 'eitc',
      programName: 'EITC (Tax Credit)',
      status: "unlikely",
      reasons: ["Valid Social Security Numbers are generally required for everyone listed on the tax return for EITC."],
      keyFactors: ["Immigration/SSN requirement"],
      learnMoreUrl: 'https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit'
    };
  }

  const annualIncome = input.grossMonthlyIncome * 12;
  const filingJoint = input.taxFilingStatus === TaxFilingStatus.MARRIED_JOINT;
  
  // 2023/2024 Approx Thresholds
  // No children: ~$17k (single) / ~$24k (joint)
  // 1 child: ~$46k / ~$53k
  // 2 children: ~$52k / ~$59k
  // 3+ children: ~$56k / ~$63k

  let limit = 0;
  if (input.childrenCount === 0) {
    limit = filingJoint ? 24210 : 17640;
  } else if (input.childrenCount === 1) {
    limit = filingJoint ? 53120 : 46560;
  } else if (input.childrenCount === 2) {
    limit = filingJoint ? 59478 : 52918;
  } else {
    limit = filingJoint ? 63398 : 56838;
  }

  keyFactors.push(`Annual Income ~$${annualIncome.toLocaleString()}`);
  keyFactors.push(`Threshold ~$${limit.toLocaleString()}`);

  if (annualIncome < limit) {
    status = "likely_eligible";
    reasons.push(`Your estimated annual income is below the limit ($${limit.toLocaleString()}) for your household size.`);
    
    // Check for investment income cap? Too complex for now, but worth noting.
  } else if (annualIncome < limit * 1.1) {
    status = "borderline";
    reasons.push("You are close to the income limit. Deductions (AGI) matter, so you might still qualify for a reduced amount.");
  } else {
    status = "unlikely";
    reasons.push("Income likely exceeds the maximum limit for the Earned Income Tax Credit.");
  }

  return {
    programId: 'eitc',
    programName: 'Federal EITC',
    status,
    reasons,
    keyFactors,
    learnMoreUrl: 'https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit'
  };
};
