import { SecurityInput, ControlResult } from '../../types';
import { RESOURCE_LINKS } from '../../constants';

export const evaluateIncidentResponse = (input: SecurityInput): ControlResult => {
  let status: ControlResult["status"] = "high_risk";
  let score = 25;

  if (input.incidentResponsePlan === "tested") {
    status = "strong";
    score = 90;
  } else if (input.incidentResponsePlan === "documented") {
    status = "needs_improvement";
    score = 65;
  } else if (input.incidentResponsePlan === "informal") {
    status = "needs_improvement";
    score = 50;
  }

  const findings = [
    `Incident response plan maturity is ${input.incidentResponsePlan}.`,
    input.hasSecurityTeam
      ? "Security team ownership helps coordinate response activities."
      : "No dedicated security team increases response coordination risk.",
  ];

  const recommendations = [
    input.incidentResponsePlan === "tested"
      ? "Keep conducting tabletop exercises twice per year."
      : "Document roles, communications, and escalation paths for incidents.",
    "Establish a breach notification playbook aligned to regulatory needs.",
  ];

  return {
    controlId: "incident-response",
    controlName: "Incident Response",
    status,
    score,
    findings,
    recommendations,
    learnMoreUrl: RESOURCE_LINKS.INCIDENT_RESPONSE,
  };
};
