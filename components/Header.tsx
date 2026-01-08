
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
        YouTube Thumbnail Clone & Enhance
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">
        Upload a YouTube thumbnail and let AI generate a unique, enhanced version inspired by the original. Customize the variation to get the perfect result.
      </p>
    </header>
  );
};
