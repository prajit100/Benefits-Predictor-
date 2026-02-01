import { SecurityInput, ControlResult } from '../../types';
import { RESOURCE_LINKS } from '../../constants';

export const evaluateTraining = (input: SecurityInput): ControlResult => {
  let status: ControlResult["status"] = "high_risk";
  let score = 30;

  if (input.trainingFrequency === "monthly" || input.trainingFrequency === "quarterly") {
    status = "strong";
    score = 88;
  } else if (input.trainingFrequency === "annual") {
    status = "needs_improvement";
    score = 60;
  }

  const findings = [
    `Security awareness training cadence is ${input.trainingFrequency}.`,
    input.remoteWorkPercentage > 50
      ? "Remote-heavy teams face elevated phishing and credential theft risk."
      : "Workforce distribution is balanced for awareness efforts.",
  ];

  const recommendations = [
    input.trainingFrequency === "none"
      ? "Launch baseline phishing training and simulated exercises."
      : "Add role-based training for executives and finance staff.",
    "Track click rates and report rates to measure program effectiveness.",
  ];

  return {
    controlId: "security-awareness",
    controlName: "Security Awareness",
    status,
    score,
    findings,
    recommendations,
    learnMoreUrl: RESOURCE_LINKS.PHISHING_RESOURCES,
  };
};
