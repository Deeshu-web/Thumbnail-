
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Controls } from './components/Controls';
import { ThumbnailDisplay } from './components/ThumbnailDisplay';
import { Loader } from './components/Loader';
import { generateThumbnail, editThumbnail } from './services/geminiService';
import type { VariationOptions } from './types';
import { DownloadIcon, EditIcon, SparklesIcon } from './components/Icons';
import { EditPanel } from './components/EditPanel';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [faceImageUrl, setFaceImageUrl] = useState<string | null>(null);
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [personImageUrl, setPersonImageUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [variationIntensity, setVariationIntensity] = useState<number>(5);
  const [newText, setNewText] = useState<string>('');
  const [isProMode, setIsProMode] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  const [variationOptions, setVariationOptions] = useState<VariationOptions>({
    colorVariation: true,
    fontChange: true,
    layoutVariation: true,
    backgroundChange: true,
    elementReplacement: true,
    textReplacement: true,
    faceChange: true,
    personChange: false,
    aspectRatio: '16:9',
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [loaderMessage, setLoaderMessage] = useState<string>('Initializing AI engine...');

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setOriginalImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setGeneratedImage(null);
      setError(null);
      setIsEditing(false);
    }
  };
  
  const handleFaceSelect = (file: File | null) => {
    if (file) {
        setFaceImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setFaceImageUrl(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const handlePersonSelect = (file: File | null) => {
    if (file) {
        setPersonImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setPersonImageUrl(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage) {
      setError('Please upload a thumbnail image first.');
      return;
    }
    if (variationOptions.faceChange && !faceImage) {
      setError('Please upload a face image or disable the "Face Change" option.');
      return;
    }
    if (variationOptions.personChange && !personImage) {
      setError('Please upload a person image or disable the "Person Change" option.');
      return;
    }

    if (isProMode && !hasApiKey) {
      await handleSelectKey();
    }

    setIsLoading(true);
    setLoaderMessage(isProMode ? 'Synthesizing Ultra HD Elements...' : 'Generating your thumbnail...');
    setError(null);
    setGeneratedImage(null);
    setIsEditing(false);

    try {
      const generatedBase64 = await generateThumbnail({
        image: originalImage,
        text: newText,
        intensity: variationIntensity,
        options: variationOptions,
        faceImage: faceImage,
        personImage: personImage,
        isPro: isProMode,
      });
      setGeneratedImage(`data:image/png;base64,${generatedBase64}`);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Requested entity was not found')) {
        setHasApiKey(false);
        setError('API Key error. Please re-select your key.');
      } else {
        setError('AI Generation Failed. Try reducing complexity or adjusting intensity.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, newText, variationIntensity, variationOptions, faceImage, personImage, isProMode, hasApiKey]);

  const handleApplyEdits = useCallback(async () => {
    if (!editPrompt || !generatedImage) {
        setError('Please enter editing instructions.');
        return;
    }
    setIsLoading(true);
    setLoaderMessage('Refining masterpiece...');
    setError(null);

    try {
        const editedBase64 = await editThumbnail({
            imageBase64: generatedImage,
            prompt: editPrompt,
        });
        setGeneratedImage(`data:image/png;base64,${editedBase64}`);
    } catch (err) {
        console.error(err);
        setError('Editing failed. The instruction might be too complex for this context.');
    } finally {
        setIsLoading(false);
    }
  }, [generatedImage, editPrompt]);
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_50%)] pointer-events-none opacity-50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        
        <main className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <FileUpload onFileSelect={handleFileSelect} imageUrl={originalImageUrl} />
            
            <Controls
              intensity={variationIntensity}
              onIntensityChange={setVariationIntensity}
              text={newText}
              onTextChange={setNewText}
              options={variationOptions}
              onOptionChange={setVariationOptions}
              onGenerate={handleGenerateClick}
              isDisabled={!originalImage || isLoading}
              faceImageUrl={faceImageUrl}
              onFaceSelect={handleFaceSelect}
              personImageUrl={personImageUrl}
              onPersonSelect={handlePersonSelect}
              isPro={isProMode}
              onProToggle={setIsProMode}
              hasKey={hasApiKey}
              onSelectKey={handleSelectKey}
            />
          </div>
          
          <div className="lg:col-span-8">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Preview Engine</h2>
                {generatedImage && (
                  <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold">READY</span>
                )}
              </div>
              
              <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4">
                {isLoading && <Loader message={loaderMessage} />}
                {error && !isLoading && (
                  <div className="max-w-md text-center">
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl animate-in fade-in zoom-in duration-300">
                        <p className="font-semibold">{error}</p>
                    </div>
                  </div>
                )}
                {!isLoading && !generatedImage && !error && (
                  <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-20 h-20 mx-auto bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800 shadow-inner">
                      <SparklesIcon className="w-10 h-10 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-500">Awaiting visual instructions</p>
                      <p className="text-sm text-slate-600">Upload your base thumbnail to begin cloning</p>
                    </div>
                  </div>
                )}
                {generatedImage && (
                  <div className="w-full h-full animate-in zoom-in duration-500">
                    <ThumbnailDisplay imageUrl={generatedImage} />
                    <div className="absolute bottom-6 right-6 flex items-center gap-3">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`bg-indigo-600/90 backdrop-blur hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 shadow-xl group ${isEditing ? 'ring-2 ring-indigo-400' : ''}`}
                      >
                        <EditIcon className="group-hover:scale-110 transition-transform" />
                        Refine
                      </button>
                      <button
                        onClick={handleDownload}
                        className="bg-cyan-600/90 backdrop-blur hover:bg-cyan-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 shadow-xl group"
                      >
                        <DownloadIcon className="group-hover:translate-y-0.5 transition-transform" />
                        Export
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {isEditing && generatedImage && (
                <div className="p-6 bg-slate-900/80 border-t border-slate-800 animate-in slide-in-from-bottom-full duration-300">
                  <EditPanel 
                      prompt={editPrompt}
                      onPromptChange={setEditPrompt}
                      onApply={handleApplyEdits}
                      onCancel={() => setIsEditing(false)}
                      isApplying={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
