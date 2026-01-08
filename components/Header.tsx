
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="relative py-4">
      <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">AI-Powered Design Studio</span>
      </div>
      <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white">
        Thumbnail <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">DNA Clone</span>
      </h1>
      <p className="mt-6 max-w-2xl text-slate-400 text-lg leading-relaxed">
        Upload any YouTube thumbnail and let <span className="text-slate-200 font-semibold underline decoration-cyan-500/30">Gemini 3 Pro</span> reverse-engineer the style, layout, and lighting to create an original high-CTR masterpiece.
      </p>
    </header>
  );
};
