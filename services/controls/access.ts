import { SecurityInput, ControlResult } from '../../types';
import { RESOURCE_LINKS } from '../../constants';

export const evaluateAccess = (input: SecurityInput): ControlResult => {
  const coverage = input.mfaCoverage;
  let status: ControlResult["status"] = "high_risk";
  let score = 35;

  if (coverage >= 90) {
    status = "strong";
    score = 92;
  } else if (coverage >= 60) {
    status = "needs_improvement";
    score = 70;
  }

  const findings = [
    `Multi-factor authentication coverage is ${coverage}%.`,
    input.hasCloudServices
      ? "Cloud services are in use, making MFA coverage especially critical."
      : "On-premises systems still benefit from MFA on privileged accounts.",
  ];

  const recommendations = [
    coverage < 90
      ? "Expand MFA to cover all privileged, remote, and cloud accounts."
      : "Maintain MFA enforcement and validate it during access reviews.",
    "Adopt phishing-resistant MFA for administrators (FIDO2 or passkeys).",
  ];

  return {
    controlId: "identity-access",
    controlName: "Identity & Access Protection",
    status,
    score,
    findings,
    recommendations,
    learnMoreUrl: RESOURCE_LINKS.CIS_CONTROLS,
  };
};
