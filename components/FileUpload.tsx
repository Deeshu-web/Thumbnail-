import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  imageUrl: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, imageUrl }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">1. Upload Original Thumbnail</h2>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative aspect-video border-2 border-dashed rounded-md flex items-center justify-center transition-colors ${isDragging ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}`}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
        />
        {imageUrl ? (
          <img src={imageUrl} alt="Uploaded Thumbnail" className="object-cover h-full w-full rounded-md" />
        ) : (
          <label htmlFor="file-upload" className="text-center text-slate-400 cursor-pointer p-4">
            <UploadIcon />
            <p className="mt-2 font-semibold">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG or WEBP</p>
          </label>
        )}
      </div>
    </div>
  );
};