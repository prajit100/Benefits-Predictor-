import { SecurityInput, ControlResult } from '../../types';
import { RESOURCE_LINKS } from '../../constants';

export const evaluateEndpointProtection = (input: SecurityInput): ControlResult => {
  let status: ControlResult["status"] = "high_risk";
  let score = 30;

  if (input.endpointProtection === "managed") {
    status = "strong";
    score = 90;
  } else if (input.endpointProtection === "basic") {
    status = "needs_improvement";
    score = 65;
  }

  const findings = [
    `Endpoint protection coverage is set to ${input.endpointProtection}.`,
    input.remoteWorkPercentage > 40
      ? "Remote work increases exposure on laptops and unmanaged networks."
      : "Remote workforce exposure is moderate based on current inputs.",
  ];

  const recommendations = [
    input.endpointProtection === "managed"
      ? "Continue monitoring endpoint telemetry and tune detection rules."
      : "Upgrade to managed EDR with centralized alerting and response workflows.",
    "Enforce disk encryption and device health checks for remote access.",
  ];

  return {
    controlId: "endpoint-security",
    controlName: "Endpoint Security",
    status,
    score,
    findings,
    recommendations,
    learnMoreUrl: RESOURCE_LINKS.CISA_STOP_RANSOMWARE,
  };
};
