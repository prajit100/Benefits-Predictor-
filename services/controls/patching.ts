import { SecurityInput, ControlResult } from '../../types';
import { RESOURCE_LINKS } from '../../constants';

export const evaluatePatching = (input: SecurityInput): ControlResult => {
  let status: ControlResult["status"] = "high_risk";
  let score = 30;

  if (input.patchingCadence === "weekly") {
    status = "strong";
    score = 90;
  } else if (input.patchingCadence === "monthly") {
    status = "needs_improvement";
    score = 65;
  }

  const findings = [
    `Patching cadence is ${input.patchingCadence.replace('_', ' ')}.`,
    input.hasCloudServices
      ? "Cloud workloads need rapid patching for internet-facing services."
      : "On-premises systems still require timely critical updates.",
  ];

  const recommendations = [
    input.patchingCadence === "ad_hoc"
      ? "Define a monthly patch window with emergency patch SLAs."
      : "Track patch coverage across operating systems and key apps.",
    "Prioritize vulnerabilities with known exploits within 7 days.",
  ];

  return {
    controlId: "vulnerability-management",
    controlName: "Patch & Vulnerability Management",
    status,
    score,
    findings,
    recommendations,
    learnMoreUrl: RESOURCE_LINKS.CIS_CONTROLS,
  };
};
