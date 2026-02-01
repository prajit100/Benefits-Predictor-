import { AssessmentResults, ControlResult, SecurityInput } from '../types';
import { evaluateAccess } from './controls/access';
import { evaluateEndpointProtection } from './controls/endpoint';
import { evaluateBackups } from './controls/backups';
import { evaluateTraining } from './controls/training';
import { evaluateIncidentResponse } from './controls/incident';
import { evaluatePatching } from './controls/patching';
import { evaluateVendors } from './controls/vendor';

const getRiskLevel = (overallScore: number): AssessmentResults['riskLevel'] => {
  if (overallScore >= 80) return 'Low';
  if (overallScore >= 60) return 'Moderate';
  return 'High';
};

export const runAssessment = (input: SecurityInput): AssessmentResults => {
  const cleanInput: SecurityInput = {
    ...input,
    remoteWorkPercentage: Math.min(100, Math.max(0, input.remoteWorkPercentage)),
    mfaCoverage: Math.min(100, Math.max(0, input.mfaCoverage)),
  };

  const controls: ControlResult[] = [
    evaluateAccess(cleanInput),
    evaluateEndpointProtection(cleanInput),
    evaluatePatching(cleanInput),
    evaluateBackups(cleanInput),
    evaluateTraining(cleanInput),
    evaluateIncidentResponse(cleanInput),
    evaluateVendors(cleanInput),
  ];

  const overallScore = Math.round(
    controls.reduce((sum, control) => sum + control.score, 0) / controls.length
  );

  return {
    timestamp: new Date().toISOString(),
    input: cleanInput,
    controls,
    overallScore,
    riskLevel: getRiskLevel(overallScore),
  };
};
