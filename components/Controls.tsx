
import React from 'react';
import type { VariationOptions } from '../types';
import { SparklesIcon, UserIcon, KeyIcon, ZapIcon } from './Icons';

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
  isPro: boolean;
  onProToggle: (val: boolean) => void;
  hasKey: boolean;
  onSelectKey: () => void;
}

const variationOptionLabels: Omit<Record<keyof VariationOptions, string>, 'aspectRatio'> = {
  colorVariation: 'Vibrant Colors',
  fontChange: '3D Typography',
  layoutVariation: 'Composition',
  backgroundChange: 'Dynamic BG',
  elementReplacement: 'AI Assets',
  textReplacement: 'Override Text',
  faceChange: 'Inject Face',
  personChange: 'Swap Person',
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
  onPersonSelect,
  isPro,
  onProToggle,
  hasKey,
  onSelectKey
}) => {
  const handleCheckboxChange = (optionKey: keyof typeof variationOptionLabels) => {
    const newOptions = { ...options, [optionKey]: !options[optionKey] };
    if (optionKey === 'faceChange' && newOptions.faceChange) newOptions.personChange = false;
    if (optionKey === 'personChange' && newOptions.personChange) newOptions.faceChange = false;
    onOptionChange(newOptions);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3">
        <button 
          onClick={() => onProToggle(!isPro)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isPro ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-800 text-slate-400'}`}
        >
          <ZapIcon className="w-3 h-3" />
          {isPro ? 'Pro Mode' : 'Standard'}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">Parameter Studio</h2>
        
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="text-xs font-bold text-slate-400">VARIATION INTENSITY</label>
            <span className="text-xl font-black text-cyan-400 leading-none">{intensity}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => onIntensityChange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {['16:9', '9:16'].map((ratio) => (
            <button
              key={ratio}
              onClick={() => onOptionChange({ ...options, aspectRatio: ratio as any })}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                options.aspectRatio === ratio
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              {ratio} {ratio === '16:9' ? 'Landscape' : 'Shorts'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Target Headline</label>
            <input
                type="text"
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="EPIC CLONE EXPERIMENT"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
        </div>

        <div className="grid grid-cols-2 gap-3">
            {[
                { id: 'face', img: faceImageUrl, handler: onFaceSelect, label: 'Identity Source' },
                { id: 'person', img: personImageUrl, handler: onPersonSelect, label: 'Body Source' }
            ].map(item => (
                <div key={item.id} className="relative group">
                    <label className="text-[10px] font-black text-slate-600 uppercase mb-1 block">{item.label}</label>
                    <div className="aspect-square bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-slate-700 transition-colors">
                        {item.img ? (
                            <img src={item.img} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-slate-800" />
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => item.handler(e.target.files?.[0] || null)} />
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Augmentations</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(variationOptionLabels) as Array<keyof typeof variationOptionLabels>).map((key) => (
            <button
                key={key}
                disabled={(key === 'faceChange' && options.personChange) || (key === 'personChange' && options.faceChange)}
                onClick={() => handleCheckboxChange(key)}
                className={`text-[10px] font-bold py-2 px-2 rounded-lg text-left transition-all border flex items-center justify-between ${
                    options[key] 
                        ? 'bg-cyan-500/5 border-cyan-500/30 text-cyan-300' 
                        : 'bg-slate-950/30 border-slate-800/50 text-slate-600 opacity-60'
                }`}
            >
                {variationOptionLabels[key]}
                <div className={`w-1.5 h-1.5 rounded-full ${options[key] ? 'bg-cyan-400' : 'bg-slate-800'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 flex flex-col gap-3">
        {isPro && !hasKey && (
          <button
            onClick={onSelectKey}
            className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500/20 transition-all text-xs"
          >
            <KeyIcon className="w-4 h-4" />
            Connect Billing Project
          </button>
        )}
        
        <button
          onClick={onGenerate}
          disabled={isDisabled}
          className={`w-full font-black py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
            isPro 
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-lg shadow-orange-900/20' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-900/20'
          } disabled:opacity-30 disabled:grayscale disabled:transform-none`}
        >
          {isPro ? <ZapIcon className="animate-pulse" /> : <SparklesIcon />}
          {isPro ? 'SYNTHESIZE PRO' : 'GENERATE CLONE'}
        </button>
      </div>
    </div>
  );
};
