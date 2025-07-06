import * as React from "react";

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = 'No data found.' }) => (
  <div className="w-full flex flex-col items-center justify-center py-12 text-slate-500">
    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2 opacity-40">
      <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="2" fill="#f1f5f9" />
      <path d="M8 12h8M8 16h4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <div className="text-lg font-medium">{message}</div>
  </div>
);

export default EmptyState; 