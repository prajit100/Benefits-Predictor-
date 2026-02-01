export type CompanySize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-1000"
  | "1000+";

export type EndpointProtectionLevel = "none" | "basic" | "managed";
export type PatchingCadence = "ad_hoc" | "monthly" | "weekly";
export type BackupFrequency = "none" | "weekly" | "daily";
export type TrainingFrequency = "none" | "annual" | "quarterly" | "monthly";
export type IncidentResponsePlan = "none" | "informal" | "documented" | "tested";
export type VendorRiskProgram = "none" | "basic" | "structured";

export interface SecurityInput {
  industry: string;
  companySize: CompanySize;
  remoteWorkPercentage: number;
  hasCloudServices: boolean;
  hasSecurityTeam: boolean;

  mfaCoverage: number;
  endpointProtection: EndpointProtectionLevel;
  patchingCadence: PatchingCadence;

  backupFrequency: BackupFrequency;
  backupTesting: boolean;
  trainingFrequency: TrainingFrequency;

  incidentResponsePlan: IncidentResponsePlan;
  vendorRiskProgram: VendorRiskProgram;
}

export type ReadinessStatus = "strong" | "needs_improvement" | "high_risk";

export interface ControlResult {
  controlId: string;
  controlName: string;
  status: ReadinessStatus;
  score: number;
  findings: string[];
  recommendations: string[];
  learnMoreUrl: string;
}

export interface AssessmentResults {
  timestamp: string;
  input: SecurityInput;
  controls: ControlResult[];
  overallScore: number;
  riskLevel: "Low" | "Moderate" | "High";
}
