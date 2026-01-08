import React from 'react';
import { SparklesIcon } from './Icons';

interface EditPanelProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    onApply: () => void;
    onCancel: () => void;
    isApplying: boolean;
}

export const EditPanel: React.FC<EditPanelProps> = ({ prompt, onPromptChange, onApply, onCancel, isApplying }) => {
    return (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
            <h3 className="text-lg font-bold text-indigo-400 mb-2">✏️ Edit Thumbnail</h3>
            <p className="text-sm text-slate-400 mb-3">Describe the changes you want to make. You can ask to add elements, move things, change colors, and more.</p>
            <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                placeholder="e.g., Add a shocked emoji. Move the text to the top left. Make the background red."
                className="block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows={3}
                disabled={isApplying}
            />
            <div className="mt-3 flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    disabled={isApplying}
                    className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onApply}
                    disabled={isApplying}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SparklesIcon />
                    Apply Edits
                </button>
            </div>
        </div>
    );
};
