import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Generating your thumbnail...' }) => {
  return (
    <div className="absolute inset-0 bg-slate-800/50 flex flex-col items-center justify-center z-10 rounded-md">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="mt-4 text-lg font-semibold text-slate-200">{message}</p>
      <p className="text-sm text-slate-400">This may take a moment.</p>
    </div>
  );
};
