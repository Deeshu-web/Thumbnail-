import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Controls } from './components/Controls';
import { ThumbnailDisplay } from './components/ThumbnailDisplay';
import { Loader } from './components/Loader';
import { generateThumbnail, editThumbnail } from './services/geminiService';
import type { VariationOptions } from './types';
import { DownloadIcon, EditIcon } from './components/Icons';
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
  const [loaderMessage, setLoaderMessage] = useState<string>('Generating your thumbnail...');

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
        reader.onloadend = () => {
            setFaceImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handlePersonSelect = (file: File | null) => {
    if (file) {
        setPersonImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPersonImageUrl(reader.result as string);
        };
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

    setIsLoading(true);
    setLoaderMessage('Generating your thumbnail...');
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
      });
      setGeneratedImage(`data:image/png;base64,${generatedBase64}`);
    } catch (err) {
      console.error(err);
      setError('Sorry, the AI failed to generate the thumbnail. This can happen with complex requests. Please try adjusting the options or using a different image.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, newText, variationIntensity, variationOptions, faceImage, personImage]);

  const handleApplyEdits = useCallback(async () => {
    if (!editPrompt || !generatedImage) {
        setError('Please enter editing instructions.');
        return;
    }
    setIsLoading(true);
    setLoaderMessage('Applying edits...');
    setError(null);

    try {
        const editedBase64 = await editThumbnail({
            imageBase64: generatedImage,
            prompt: editPrompt,
        });
        setGeneratedImage(`data:image/png;base64,${editedBase64}`);
    } catch (err) {
        console.error(err);
        setError('Sorry, the AI failed to apply the edits. Please try a different instruction.');
    } finally {
        setIsLoading(false);
    }
  }, [generatedImage, editPrompt]);
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated-thumbnail.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
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
            />
          </div>
          <div className="lg:col-span-8">
            <div className="bg-slate-800/50 rounded-lg p-6 shadow-lg h-full flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Generated Thumbnail</h2>
              <div className="relative aspect-video bg-slate-700 rounded-md flex items-center justify-center">
                {isLoading && <Loader message={loaderMessage} />}
                {error && !isLoading && <p className="text-red-400 text-center p-4">{error}</p>}
                {!isLoading && !generatedImage && !error && (
                  <div className="text-center text-slate-400">
                    <p>Your generated thumbnail will appear here.</p>
                    <p className="text-sm">Upload an image and click "Generate".</p>
                  </div>
                )}
                {generatedImage && (
                  <>
                    <ThumbnailDisplay imageUrl={generatedImage} />
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`bg-indigo-500 text-white font-bold py-2 px-4 rounded-full hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg ${isEditing ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-indigo-400' : ''}`}
                        aria-pressed={isEditing}
                      >
                        <EditIcon />
                        Edit
                      </button>
                      <button
                        onClick={handleDownload}
                        className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-full hover:bg-cyan-600 transition-colors flex items-center gap-2 shadow-lg"
                      >
                        <DownloadIcon />
                        Download
                      </button>
                    </div>
                  </>
                )}
              </div>
              {isEditing && generatedImage && (
                <EditPanel 
                    prompt={editPrompt}
                    onPromptChange={setEditPrompt}
                    onApply={handleApplyEdits}
                    onCancel={() => setIsEditing(false)}
                    isApplying={isLoading}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
