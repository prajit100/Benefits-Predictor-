import React, { useState } from 'react';
import { HouseholdInput, AssessmentResults, ImmigrationStatus, TaxFilingStatus } from './types';
import { STATES } from './constants';
import { runAssessment } from './services/engine';
import { ProgramCard } from './components/ProgramCard';

// --- Views ---
// I'm putting Views in App.tsx for simplicity of the file structure in this specific prompt format,
// but in a large project, they would be separate files.

// --- 1. LANDING VIEW ---
const LandingView: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="max-w-2xl mx-auto text-center py-12 px-4">
    <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
      U.S. Public Benefits Eligibility Predictor
    </h1>
    <p className="text-lg text-gray-600 mb-8">
      Navigating public assistance can be confusing. Our tool asks you a few simple questions to estimate your eligibility for programs like SNAP (Food Stamps), Medicaid, WIC, and more.
    </p>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
      <h3 className="font-bold text-blue-800 mb-2">How it works:</h3>
      <ul className="list-disc pl-5 space-y-2 text-blue-900">
        <li>Answer questions about your household size, income, and location.</li>
        <li>Our system checks your data against simplified federal and state rules.</li>
        <li>Get an instant summary of programs you might qualify for.</li>
        <li><strong>Private & Secure:</strong> We do not store your data. It runs entirely in your browser.</li>
      </ul>
    </div>
    <button 
      onClick={onStart}
      className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105"
    >
      Start Assessment
    </button>
  </div>
);

// --- 2. QUESTIONNAIRE VIEW ---
const initialFormState: HouseholdInput = {
  state: 'CA',
  householdSize: 1,
  childrenCount: 0,
  childrenUnder5Count: 0,
  elderlyCount: 0,
  grossMonthlyIncome: 0,
  monthlyHousingCost: 0,
  isPregnant: false,
  immigrationStatus: ImmigrationStatus.CITIZEN,
  hasDisability: false,
  hasEarnedIncome: false,
  monthlyEarnedIncome: 0,
  taxFilingStatus: TaxFilingStatus.SINGLE
};

const QuestionnaireView: React.FC<{ onSubmit: (data: HouseholdInput) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<HouseholdInput>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof HouseholdInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.householdSize < 1) newErrors.householdSize = "Household size must be at least 1";
    if (formData.grossMonthlyIncome < 0) newErrors.grossMonthlyIncome = "Income cannot be negative";
    if (formData.childrenCount > formData.householdSize) newErrors.childrenCount = "Children count cannot exceed household size";
    
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Household Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State of Residence</label>
          <select 
            className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
          >
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Household Size</label>
          <input 
            type="number" min="1"
            className="w-full border border-gray-300 rounded p-2"
            value={formData.householdSize}
            onChange={(e) => handleChange('householdSize', parseInt(e.target.value) || 0)}
          />
          {errors.householdSize && <p className="text-red-500 text-xs mt-1">{errors.householdSize}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Children under 18</label>
          <input 
            type="number" min="0"
            className="w-full border border-gray-300 rounded p-2"
            value={formData.childrenCount}
            onChange={(e) => handleChange('childrenCount', parseInt(e.target.value) || 0)}
          />
        </div>
        
        {formData.childrenCount > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Children under 5</label>
            <input 
              type="number" min="0" max={formData.childrenCount}
              className="w-full border border-gray-300 rounded p-2"
              value={formData.childrenUnder5Count}
              onChange={(e) => handleChange('childrenUnder5Count', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500">Specific for WIC eligibility.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adults 65+ (Seniors)</label>
          <input 
            type="number" min="0"
            className="w-full border border-gray-300 rounded p-2"
            value={formData.elderlyCount}
            onChange={(e) => handleChange('elderlyCount', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 mt-10">Financials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gross Monthly Income (Pre-tax)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input 
              type="number" min="0"
              className="w-full border border-gray-300 rounded p-2 pl-7"
              value={formData.grossMonthlyIncome}
              onChange={(e) => handleChange('grossMonthlyIncome', parseFloat(e.target.value) || 0)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Include wages, social security, pensions, etc.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Housing Cost (Rent/Mortgage)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input 
              type="number" min="0"
              className="w-full border border-gray-300 rounded p-2 pl-7"
              value={formData.monthlyHousingCost || ''}
              onChange={(e) => handleChange('monthlyHousingCost', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-center space-x-3 mb-3">
          <input 
            type="checkbox" 
            className="h-5 w-5 text-blue-600"
            checked={formData.hasEarnedIncome}
            onChange={(e) => handleChange('hasEarnedIncome', e.target.checked)}
          />
          <span className="text-gray-700 font-medium">Does anyone in the household work for pay?</span>
        </label>
        
        {formData.hasEarnedIncome && (
          <div className="ml-8 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Earned Income (Wages/Self-Employment)</label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input 
                type="number" min="0"
                className="w-full border border-gray-300 rounded p-2 pl-7"
                value={formData.monthlyEarnedIncome}
                onChange={(e) => handleChange('monthlyEarnedIncome', parseFloat(e.target.value) || 0)}
              />
            </div>
             <p className="text-xs text-gray-500 mt-1">Important for EITC.</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 mt-10">Personal Details</h2>
      <div className="space-y-4 mb-6">
         <label className="flex items-center space-x-3">
          <input 
            type="checkbox" 
            className="h-5 w-5 text-blue-600"
            checked={formData.isPregnant}
            onChange={(e) => handleChange('isPregnant', e.target.checked)}
          />
          <span className="text-gray-700">Is anyone in the household currently pregnant?</span>
        </label>

        <label className="flex items-center space-x-3">
          <input 
            type="checkbox" 
            className="h-5 w-5 text-blue-600"
            checked={formData.hasDisability}
            onChange={(e) => handleChange('hasDisability', e.target.checked)}
          />
          <span className="text-gray-700">Does anyone have a disability or serious medical condition?</span>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Applicant Immigration Status</label>
          <select 
             className="w-full md:w-2/3 border border-gray-300 rounded p-2"
             value={formData.immigrationStatus}
             onChange={(e) => handleChange('immigrationStatus', e.target.value)}
          >
            <option value={ImmigrationStatus.CITIZEN}>U.S. Citizen</option>
            <option value={ImmigrationStatus.LPR_5_PLUS}>Permanent Resident (Green Card) 5+ Years</option>
            <option value={ImmigrationStatus.LPR_LESS_5}>Permanent Resident (Green Card) &lt; 5 Years</option>
            <option value={ImmigrationStatus.OTHER_DOCUMENTED}>Other Documented (Refugee, Asylee, etc.)</option>
            <option value={ImmigrationStatus.UNDOCUMENTED}>Undocumented / Not disclosed</option>
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Tax Filing Status (for EITC estimate)</label>
           <select 
             className="w-full md:w-2/3 border border-gray-300 rounded p-2"
             value={formData.taxFilingStatus}
             onChange={(e) => handleChange('taxFilingStatus', e.target.value)}
          >
            <option value={TaxFilingStatus.SINGLE}>Single</option>
            <option value={TaxFilingStatus.MARRIED_JOINT}>Married Filing Jointly</option>
            <option value={TaxFilingStatus.HEAD_OF_HOUSEHOLD}>Head of Household</option>
            <option value={TaxFilingStatus.OTHER}>Other</option>
          </select>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t flex justify-end">
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow text-lg"
        >
          Check Eligibility
        </button>
      </div>
    </form>
  );
};

// --- 3. RESULTS VIEW ---
const ResultsView: React.FC<{ results: AssessmentResults, onReset: () => void }> = ({ results, onReset }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6 no-print">
        <button onClick={onReset} className="text-blue-600 underline hover:text-blue-800">
          &larr; Start Over
        </button>
        <button onClick={handlePrint} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded">
          Download / Print Summary
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-8 border-t-8 border-blue-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Eligibility Estimate Summary</h2>
        <p className="text-gray-600 mb-6">
          Based on a household of <strong>{results.input.householdSize}</strong> in <strong>{results.input.state}</strong> with a monthly gross income of <strong>${results.input.grossMonthlyIncome.toLocaleString()}</strong>.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {results.programs.map(p => {
             let colorClass = "bg-gray-100 text-gray-600";
             if (p.status === 'likely_eligible') colorClass = "bg-green-100 text-green-800 border-green-300 border";
             if (p.status === 'borderline') colorClass = "bg-yellow-100 text-yellow-800 border-yellow-300 border";
             
             return (
               <div key={p.programId} className={`p-3 rounded text-center font-medium ${colorClass}`}>
                 <div className="text-xs uppercase opacity-75">Program</div>
                 <div className="font-bold">{p.programName}</div>
                 <div className="text-sm mt-1 capitalize">{p.status.replace('_', ' ')}</div>
               </div>
             )
          })}
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Detailed Breakdown</h3>
        <div>
          {results.programs.map(program => (
            <ProgramCard key={program.programId} result={program} />
          ))}
        </div>

        <div className="mt-10 p-6 bg-gray-50 rounded text-sm text-gray-600">
          <h4 className="font-bold text-gray-800 mb-2">Disclaimer</h4>
          <p>
            This tool provides an approximate eligibility estimate for educational purposes only. It does not guarantee that you will qualify for any program. Actual eligibility and benefits depend on detailed rules, asset limits, and official determinations by government agencies. For final decisions, please apply through official state or federal websites or speak with a qualified benefits counselor.
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

  const handleFormSubmit = async (data: HouseholdInput) => {
    setIsComputing(true);
    // Simulate computation delay for UX
    setTimeout(() => {
      const resultData = runAssessment(data);
      setResults(resultData);
      setIsComputing(false);
      setView('results');
      window.scrollTo(0,0);
    }, 800);
  };

  const handleReset = () => {
    setResults(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm py-4 no-print">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="font-bold text-xl text-blue-800 flex items-center gap-2">
            <span className="text-2xl">🇺🇸</span> BenefitsPredictor
          </div>
          {view !== 'landing' && (
             <div className="text-sm text-gray-500 hidden md:block">Educational Estimator Tool</div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-8">
        {isComputing ? (
          <div className="flex flex-col items-center justify-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
             <p className="text-gray-600 font-medium">Analyzing household data against federal rules...</p>
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
      <footer className="bg-gray-800 text-gray-300 py-6 mt-auto no-print">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            <a href="https://www.benefits.gov/" target="_blank" rel="noreferrer" className="underline text-white hover:text-blue-200">
              Learn more about U.S. public benefits at Benefits.gov
            </a>
          </p>
          <p className="text-sm opacity-70">
            &copy; {new Date().getFullYear()} U.S. Benefits Eligibility Predictor. Not a government agency.
          </p>
        </div>
      </footer>
    </div>
  );
}
