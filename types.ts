export enum ImmigrationStatus {
  CITIZEN = "citizen",
  LPR_5_PLUS = "lpr_5_plus",
  LPR_LESS_5 = "lpr_less_5",
  OTHER_DOCUMENTED = "other_documented",
  UNDOCUMENTED = "undocumented",
}

export enum TaxFilingStatus {
  SINGLE = "single",
  MARRIED_JOINT = "married_joint",
  HEAD_OF_HOUSEHOLD = "head_of_household",
  OTHER = "other",
}

export interface HouseholdInput {
  state: string;
  zipCode?: string;
  householdSize: number;
  childrenCount: number;
  childrenUnder5Count: number; // Derived or asked if childrenCount > 0
  elderlyCount: number;
  
  grossMonthlyIncome: number;
  netMonthlyIncome?: number; // Optional, but good for SNAP if we had complex logic
  monthlyHousingCost?: number;
  childcareCost?: number;
  
  isPregnant: boolean;
  immigrationStatus: ImmigrationStatus;
  hasDisability: boolean;
  
  hasEarnedIncome: boolean;
  monthlyEarnedIncome: number;
  taxFilingStatus: TaxFilingStatus;
}

export type EligibilityStatus = "likely_eligible" | "borderline" | "unlikely";

export interface ProgramResult {
  programId: string;
  programName: string;
  status: EligibilityStatus;
  reasons: string[];
  keyFactors: string[];
  learnMoreUrl: string;
}

export interface AssessmentResults {
  timestamp: string;
  input: HouseholdInput;
  programs: ProgramResult[];
  fplPercentage: number; // For display purposes
}
