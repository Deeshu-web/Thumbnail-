
import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Synthesizing creative assets...' }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-2xl overflow-hidden">
      <div className="relative">
        {/* Layered animations for a "premium" feel */}
        <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
            <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin [animation-duration:0.8s]" />
            <div className="absolute inset-4 border-4 border-slate-800 rounded-full" />
            <div className="absolute inset-4 border-b-4 border-indigo-400 rounded-full animate-spin [animation-duration:1.2s] direction-reverse" />
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-1">
        <p className="text-xl font-black text-white tracking-tight animate-pulse uppercase italic">{message}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Gemini AI Neural Processor v3</p>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 w-1/3 animate-[loading-bar_2s_infinite_ease-in-out]" />
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};
