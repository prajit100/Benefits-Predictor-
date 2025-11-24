import React from 'react';
import { ProgramResult, EligibilityStatus } from '../types';

interface ProgramCardProps {
  result: ProgramResult;
}

const statusConfig: Record<EligibilityStatus, { color: string; label: string; icon: string }> = {
  likely_eligible: {
    color: "bg-green-100 border-green-500 text-green-800",
    label: "Likely Eligible",
    icon: "✅"
  },
  borderline: {
    color: "bg-yellow-100 border-yellow-500 text-yellow-800",
    label: "Borderline / Uncertain",
    icon: "⚠️"
  },
  unlikely: {
    color: "bg-gray-100 border-gray-400 text-gray-600",
    label: "Unlikely",
    icon: "🛑"
  }
};

export const ProgramCard: React.FC<ProgramCardProps> = ({ result }) => {
  const { color, label, icon } = statusConfig[result.status];

  return (
    <div className={`border-l-4 rounded-r shadow-sm p-6 mb-4 bg-white ${color.split(' ')[1]}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900">{result.programName}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
          {icon} {label}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">Analysis</h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {result.reasons.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
      </div>
      
      {result.keyFactors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">Key Factors</h4>
          <div className="flex flex-wrap gap-2">
            {result.keyFactors.map((f, idx) => (
              <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
        <p className="text-xs text-gray-500 italic">This is an estimate, not a guarantee.</p>
        <a 
          href={result.learnMoreUrl} 
          target="_blank" 
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
        >
          Next Steps & Official Info &rarr;
        </a>
      </div>
    </div>
  );
};
