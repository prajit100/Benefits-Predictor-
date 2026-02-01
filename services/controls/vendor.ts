import { SecurityInput, ControlResult } from '../../types';
import { RESOURCE_LINKS } from '../../constants';

export const evaluateVendors = (input: SecurityInput): ControlResult => {
  let status: ControlResult["status"] = "high_risk";
  let score = 28;

  if (input.vendorRiskProgram === "structured") {
    status = "strong";
    score = 88;
  } else if (input.vendorRiskProgram === "basic") {
    status = "needs_improvement";
    score = 60;
  }

  const findings = [
    `Third-party risk management is ${input.vendorRiskProgram}.`,
    input.hasCloudServices
      ? "Cloud vendors introduce shared responsibility considerations."
      : "Vendor risk still applies to SaaS and IT providers.",
  ];

  const recommendations = [
    input.vendorRiskProgram === "structured"
      ? "Continue annual vendor reviews and contract security clauses."
      : "Create a vendor inventory and security questionnaire process.",
    "Require incident notification SLAs for critical suppliers.",
  ];

  return {
    controlId: "third-party-risk",
    controlName: "Third-Party Risk",
    status,
    score,
    findings,
    recommendations,
    learnMoreUrl: RESOURCE_LINKS.NIST_CSF,
  };
};
