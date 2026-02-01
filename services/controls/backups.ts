import { SecurityInput, ControlResult } from '../../types';
import { RESOURCE_LINKS } from '../../constants';

export const evaluateBackups = (input: SecurityInput): ControlResult => {
  let status: ControlResult["status"] = "high_risk";
  let score = 35;

  if (input.backupFrequency === "daily" && input.backupTesting) {
    status = "strong";
    score = 92;
  } else if (input.backupFrequency !== "none") {
    status = "needs_improvement";
    score = 65;
  }

  const findings = [
    `Backup frequency is ${input.backupFrequency}.`,
    input.backupTesting
      ? "Backups are tested for recovery." 
      : "Backups are not regularly tested for recovery.",
  ];

  const recommendations = [
    input.backupFrequency === "none"
      ? "Implement automated backups with offline or immutable copies."
      : "Increase backup frequency for critical systems and data stores.",
    input.backupTesting
      ? "Continue quarterly restore drills to validate recovery time."
      : "Schedule restore testing to validate integrity and RTO targets.",
  ];

  return {
    controlId: "data-resilience",
    controlName: "Backup & Recovery",
    status,
    score,
    findings,
    recommendations,
    learnMoreUrl: RESOURCE_LINKS.CISA_STOP_RANSOMWARE,
  };
};
