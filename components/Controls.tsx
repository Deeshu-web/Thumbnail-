import React from 'react';
import type { VariationOptions } from '../types';
import { SparklesIcon, UserIcon } from './Icons';

interface ControlsProps {
  intensity: number;
  onIntensityChange: (value: number) => void;
  text: string;
  onTextChange: (value: string) => void;
  options: VariationOptions;
  onOptionChange: (options: VariationOptions) => void;
  onGenerate: () => void;
  isDisabled: boolean;
  faceImageUrl: string | null;
  onFaceSelect: (file: File | null) => void;
  personImageUrl: string | null;
  onPersonSelect: (file: File | null) => void;
}

const variationOptionLabels: Omit<Record<keyof VariationOptions, string>, 'aspectRatio'> = {
  colorVariation: 'Color Palette',
  fontChange: 'Font Style',
  layoutVariation: 'Layout & Composition',
  backgroundChange: 'Background',
  elementReplacement: 'Graphical Elements',
  textReplacement: 'Replace Text',
  faceChange: 'Face Change',
  personChange: 'Person Change',
};

export const Controls: React.FC<ControlsProps> = ({
  intensity,
  onIntensityChange,
  text,
  onTextChange,
  options,
  onOptionChange,
  onGenerate,
  isDisabled,
  faceImageUrl,
  onFaceSelect,
  personImageUrl,
  onPersonSelect
}) => {
  const handleCheckboxChange = (optionKey: keyof typeof variationOptionLabels) => {
    const newOptions = {
      ...options,
      [optionKey]: !options[optionKey],
    };
    // Enforce mutual exclusivity
    if (optionKey === 'faceChange' && newOptions.faceChange) {
      newOptions.personChange = false;
    }
    if (optionKey === 'personChange' && newOptions.personChange) {
      newOptions.faceChange = false;
    }
    onOptionChange(newOptions);
  };

  const handleFaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFaceSelect(e.target.files[0]);
    }
  };

  const handlePersonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onPersonSelect(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 shadow-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4 text-cyan-400">2. Customize Variation</h2>
        
        <label htmlFor="intensity" className="block text-sm font-medium text-slate-300">Variation Intensity: <span className="font-bold text-cyan-400">{intensity}</span></label>
        <input
          id="intensity"
          type="range"
          min="1"
          max="10"
          value={intensity}
          onChange={(e) => onIntensityChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2"
          style={{
            background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${intensity * 10}%, #475569 ${intensity * 10}%, #475569 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Similar</span>
          <span>Reimagined</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
        <div className="flex gap-2">
          <button
            onClick={() => onOptionChange({ ...options, aspectRatio: '16:9' })}
            className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
              options.aspectRatio === '16:9'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            16:9 (Landscape)
          </button>
          <button
            onClick={() => onOptionChange({ ...options, aspectRatio: '9:16' })}
            className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
              options.aspectRatio === '9:16'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            9:16 (Portrait)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4">
        <div className="md:col-span-2">
            <label htmlFor="newText" className="block text-sm font-medium text-slate-300">New Thumbnail Text</label>
            <input
            id="newText"
            type="text"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="e.g., EPIC NEW VIDEO!"
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            />
        </div>
        <div>
            <label htmlFor="face-upload" className="block text-sm font-medium text-slate-300">Upload Face Image</label>
            <div className="mt-1 flex items-center gap-2">
                <div className="w-16 h-10 bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
                    {faceImageUrl ? (
                        <img src={faceImageUrl} alt="Face Preview" className="h-full w-full object-cover" />
                    ) : (
                       <UserIcon />
                    )}
                </div>
                <label htmlFor="face-upload" className="relative cursor-pointer bg-slate-700 hover:bg-slate-600 text-cyan-400 font-semibold py-2 px-3 border border-slate-600 rounded-md shadow-sm text-sm w-full text-center">
                    <span>Select Face</span>
                    <input id="face-upload" name="face-upload" type="file" className="sr-only" onChange={handleFaceFileChange} accept="image/png, image/jpeg, image/webp" />
                </label>
            </div>
        </div>
        <div>
            <label htmlFor="person-upload" className="block text-sm font-medium text-slate-300">Upload Person Image</label>
            <div className="mt-1 flex items-center gap-2">
                <div className="w-16 h-10 bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
                    {personImageUrl ? (
                        <img src={personImageUrl} alt="Person Preview" className="h-full w-full object-cover" />
                    ) : (
                       <UserIcon />
                    )}
                </div>
                <label htmlFor="person-upload" className="relative cursor-pointer bg-slate-700 hover:bg-slate-600 text-cyan-400 font-semibold py-2 px-3 border border-slate-600 rounded-md shadow-sm text-sm w-full text-center">
                    <span>Select Person</span>
                    <input id="person-upload" name="person-upload" type="file" className="sr-only" onChange={handlePersonFileChange} accept="image/png, image/jpeg, image/webp" />
                </label>
            </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">Variation Options</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(variationOptionLabels) as Array<keyof typeof variationOptionLabels>).map((key) => (
            <div key={key} className="flex items-center">
              <input
                id={key}
                type="checkbox"
                checked={options[key]}
                onChange={() => handleCheckboxChange(key)}
                className="h-4 w-4 rounded border-slate-500 text-cyan-500 bg-slate-700 focus:ring-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={(key === 'faceChange' && options.personChange) || (key === 'personChange' && options.faceChange)}
              />
              <label htmlFor={key} className={`ml-2 block text-sm text-slate-300 ${( (key === 'faceChange' && options.personChange) || (key === 'personChange' && options.faceChange) ) ? 'opacity-50' : ''}`}>{variationOptionLabels[key]}</label>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isDisabled}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
      >
        <SparklesIcon />
        Generate
      </button>
    </div>
  );
};
