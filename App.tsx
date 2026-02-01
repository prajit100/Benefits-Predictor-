import React, { useState } from 'react';
import {
  AssessmentResults,
  SecurityInput,
  EndpointProtectionLevel,
  PatchingCadence,
  BackupFrequency,
  TrainingFrequency,
  IncidentResponsePlan,
  VendorRiskProgram,
} from './types';
import { INDUSTRIES, COMPANY_SIZES } from './constants';
import { runAssessment } from './services/engine';
import { ControlCard } from './components/ControlCard';

// --- Views ---
// Keeping views in App.tsx for a simple file structure.

// --- 1. LANDING VIEW ---
const LandingView: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="max-w-2xl mx-auto text-center py-12 px-4">
    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
      Cybersecurity Readiness Snapshot
    </h1>
    <p className="text-lg text-slate-600 mb-8">
      Get a quick, structured view of your organization&apos;s security posture. Answer a few
      questions to receive a prioritized readiness summary aligned with modern security
      frameworks.
    </p>
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 text-left">
      <h3 className="font-bold text-slate-800 mb-2">What you&apos;ll get:</h3>
      <ul className="list-disc pl-5 space-y-2 text-slate-700">
        <li>Control-level readiness ratings across access, endpoints, backups, and response.</li>
        <li>Actionable recommendations you can share with leadership.</li>
        <li>Links to official guidance from CISA, NIST, and CIS.</li>
        <li>
          <strong>Private by design:</strong> responses never leave your browser.
        </li>
      </ul>
    </div>
    <button
      onClick={onStart}
      className="bg-slate-900 hover:bg-slate-800 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105"
    >
      Start Assessment
    </button>
  </div>
);

// --- 2. QUESTIONNAIRE VIEW ---
const initialFormState: SecurityInput = {
  industry: 'Technology',
  companySize: '11-50',
  remoteWorkPercentage: 30,
  hasCloudServices: true,
  hasSecurityTeam: false,
  mfaCoverage: 60,
  endpointProtection: 'basic',
  patchingCadence: 'monthly',
  backupFrequency: 'weekly',
  backupTesting: false,
  trainingFrequency: 'annual',
  incidentResponsePlan: 'informal',
  vendorRiskProgram: 'basic',
};

const QuestionnaireView: React.FC<{ onSubmit: (data: SecurityInput) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<SecurityInput>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof SecurityInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.remoteWorkPercentage < 0 || formData.remoteWorkPercentage > 100) {
      newErrors.remoteWorkPercentage = 'Remote work must be between 0 and 100%';
    }
    if (formData.mfaCoverage < 0 || formData.mfaCoverage > 100) {
      newErrors.mfaCoverage = 'MFA coverage must be between 0 and 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 md:p-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Organization Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
          <select
            className="w-full border border-slate-300 rounded p-2 focus:ring-slate-500 focus:border-slate-500"
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
          >
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
          <select
            className="w-full border border-slate-300 rounded p-2"
            value={formData.companySize}
            onChange={(e) => handleChange('companySize', e.target.value)}
          >
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} employees
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Remote Workforce (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full border border-slate-300 rounded p-2"
            value={formData.remoteWorkPercentage}
            onChange={(e) => handleChange('remoteWorkPercentage', parseInt(e.target.value, 10) || 0)}
          />
          {errors.remoteWorkPercentage && (
            <p className="text-rose-500 text-xs mt-1">{errors.remoteWorkPercentage}</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-5 w-5 text-slate-700"
            checked={formData.hasCloudServices}
            onChange={(e) => handleChange('hasCloudServices', e.target.checked)}
          />
          <span className="text-slate-700 font-medium">We rely on cloud services</span>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-5 w-5 text-slate-700"
            checked={formData.hasSecurityTeam}
            onChange={(e) => handleChange('hasSecurityTeam', e.target.checked)}
          />
          <span className="text-slate-700 font-medium">We have a dedicated security team</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2 mt-10">Access & Devices</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">MFA Coverage (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full border border-slate-300 rounded p-2"
            value={formData.mfaCoverage}
            onChange={(e) => handleChange('mfaCoverage', parseInt(e.target.value, 10) || 0)}
          />
          {errors.mfaCoverage && <p className="text-rose-500 text-xs mt-1">{errors.mfaCoverage}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Endpoint Protection</label>
          <select
            className="w-full border border-slate-300 rounded p-2"
            value={formData.endpointProtection}
            onChange={(e) => handleChange('endpointProtection', e.target.value as EndpointProtectionLevel)}
          >
            <option value="none">None / Basic Antivirus</option>
            <option value="basic">Managed Antivirus + Alerts</option>
            <option value="managed">Managed EDR + 24/7 Response</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Patching Cadence</label>
          <select
            className="w-full border border-slate-300 rounded p-2"
            value={formData.patchingCadence}
            onChange={(e) => handleChange('patchingCadence', e.target.value as PatchingCadence)}
          >
            <option value="ad_hoc">Ad hoc / When issues arise</option>
            <option value="monthly">Monthly with urgent patch window</option>
            <option value="weekly">Weekly with emergency SLAs</option>
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2 mt-10">Data Protection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Backup Frequency</label>
          <select
            className="w-full border border-slate-300 rounded p-2"
            value={formData.backupFrequency}
            onChange={(e) => handleChange('backupFrequency', e.target.value as BackupFrequency)}
          >
            <option value="none">No automated backups</option>
            <option value="weekly">Weekly backups</option>
            <option value="daily">Daily backups</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-5 w-5 text-slate-700"
            checked={formData.backupTesting}
            onChange={(e) => handleChange('backupTesting', e.target.checked)}
          />
          <span className="text-slate-700 font-medium">We test backup restoration</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Training Frequency</label>
          <select
            className="w-full border border-slate-300 rounded p-2"
            value={formData.trainingFrequency}
            onChange={(e) => handleChange('trainingFrequency', e.target.value as TrainingFrequency)}
          >
            <option value="none">No formal training</option>
            <option value="annual">Annual awareness training</option>
            <option value="quarterly">Quarterly training + simulations</option>
            <option value="monthly">Monthly micro-trainings</option>
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2 mt-10">Preparedness</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Incident Response Plan</label>
          <select
            className="w-full border border-slate-300 rounded p-2"
            value={formData.incidentResponsePlan}
            onChange={(e) =>
              handleChange('incidentResponsePlan', e.target.value as IncidentResponsePlan)
            }
          >
            <option value="none">No plan</option>
            <option value="informal">Informal checklist only</option>
            <option value="documented">Documented plan</option>
            <option value="tested">Tested via tabletop exercises</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Vendor Risk Management</label>
          <select
            className="w-full border border-slate-300 rounded p-2"
            value={formData.vendorRiskProgram}
            onChange={(e) => handleChange('vendorRiskProgram', e.target.value as VendorRiskProgram)}
          >
            <option value="none">No formal process</option>
            <option value="basic">Basic questionnaires</option>
            <option value="structured">Structured program with reviews</option>
          </select>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t flex justify-end">
        <button
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded shadow text-lg"
        >
          Generate Security Snapshot
        </button>
      </div>
    </form>
  );
};

// --- 3. RESULTS VIEW ---
const ResultsView: React.FC<{ results: AssessmentResults; onReset: () => void }> = ({
  results,
  onReset,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const riskBadgeStyles: Record<AssessmentResults['riskLevel'], string> = {
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    High: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6 no-print">
        <button onClick={onReset} className="text-slate-700 underline hover:text-slate-900">
          &larr; Start Over
        </button>
        <button
          onClick={handlePrint}
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded"
        >
          Download / Print Summary
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8 border-t-8 border-slate-900">
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Readiness Summary</h2>
            <p className="text-slate-600">
              Based on a {results.input.companySize} employee organization in the{' '}
              {results.input.industry} industry.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm uppercase tracking-wide text-slate-500">Overall Score</p>
            <p className="text-4xl font-bold text-slate-900">{results.overallScore}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 text-sm font-semibold border rounded-full ${riskBadgeStyles[results.riskLevel]}`}
            >
              {results.riskLevel} Risk
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {results.controls.map((control) => {
            let colorClass = 'bg-slate-100 text-slate-600';
            if (control.status === 'strong') colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 border';
            if (control.status === 'needs_improvement')
              colorClass = 'bg-amber-100 text-amber-800 border-amber-300 border';
            if (control.status === 'high_risk') colorClass = 'bg-rose-100 text-rose-800 border-rose-300 border';

            return (
              <div key={control.controlId} className={`p-3 rounded text-center font-medium ${colorClass}`}>
                <div className="text-xs uppercase opacity-75">Control</div>
                <div className="font-bold">{control.controlName}</div>
                <div className="text-sm mt-1 capitalize">{control.status.replace('_', ' ')}</div>
              </div>
            );
          })}
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b">Detailed Recommendations</h3>
        <div>
          {results.controls.map((control) => (
            <ControlCard key={control.controlId} result={control} />
          ))}
        </div>

        <div className="mt-10 p-6 bg-slate-50 rounded text-sm text-slate-600">
          <h4 className="font-bold text-slate-800 mb-2">Disclaimer</h4>
          <p>
            This assessment provides a high-level snapshot and does not replace a formal security
            audit or compliance review. Use it to prioritize next steps, then validate with your
            security team or trusted advisors.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState<'landing' | 'form' | 'results'>('landing');
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  const handleStart = () => setView('form');

  const handleFormSubmit = async (data: SecurityInput) => {
    setIsComputing(true);
    setTimeout(() => {
      const resultData = runAssessment(data);
      setResults(resultData);
      setIsComputing(false);
      setView('results');
      window.scrollTo(0, 0);
    }, 800);
  };

  const handleReset = () => {
    setResults(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm py-4 no-print">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="font-bold text-xl text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🛡️</span> CyberSecure Snapshot
          </div>
          {view !== 'landing' && (
            <div className="text-sm text-slate-500 hidden md:block">Rapid posture assessment</div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-8">
        {isComputing ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-slate-900 mb-4"></div>
            <p className="text-slate-600 font-medium">Analyzing your security controls...</p>
          </div>
        ) : (
          <>
            {view === 'landing' && <LandingView onStart={handleStart} />}
            {view === 'form' && <QuestionnaireView onSubmit={handleFormSubmit} />}
            {view === 'results' && results && <ResultsView results={results} onReset={handleReset} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-200 py-6 mt-auto no-print">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            <a
              href="https://www.cisa.gov/stopransomware"
              target="_blank"
              rel="noreferrer"
              className="underline text-white hover:text-slate-200"
            >
              Explore CISA&apos;s ransomware readiness guidance
            </a>
          </p>
          <p className="text-sm opacity-70">
            &copy; {new Date().getFullYear()} CyberSecure Snapshot. Educational use only.
          </p>
        </div>
      </footer>
    </div>
  );
}
