import React from 'react';
import { ControlResult, ReadinessStatus } from '../types';

interface ControlCardProps {
  result: ControlResult;
}

const statusConfig: Record<ReadinessStatus, { color: string; label: string; icon: string }> = {
  strong: {
    color: "bg-emerald-100 border-emerald-500 text-emerald-800",
    label: "Strong",
    icon: "✅",
  },
  needs_improvement: {
    color: "bg-amber-100 border-amber-500 text-amber-800",
    label: "Needs Improvement",
    icon: "⚠️",
  },
  high_risk: {
    color: "bg-rose-100 border-rose-500 text-rose-800",
    label: "High Risk",
    icon: "🛑",
  },
};

export const ControlCard: React.FC<ControlCardProps> = ({ result }) => {
  const { color, label, icon } = statusConfig[result.status];

  return (
    <div className={`border-l-4 rounded-r shadow-sm p-6 mb-4 bg-white ${color.split(' ')[1]}`}>
      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{result.controlName}</h3>
          <p className="text-sm text-gray-500">Score: {result.score}/100</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
          {icon} {label}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">Findings</h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {result.findings.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">Recommendations</h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {result.recommendations.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
        <p className="text-xs text-gray-500 italic">This is a directional assessment, not a certification.</p>
        <a
          href={result.learnMoreUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
        >
          Learn more &rarr;
        </a>
      </div>
    </div>
  );
};
