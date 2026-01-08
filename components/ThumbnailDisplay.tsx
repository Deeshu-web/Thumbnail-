import React from 'react';

interface ThumbnailDisplayProps {
  imageUrl: string;
}

export const ThumbnailDisplay: React.FC<ThumbnailDisplayProps> = ({ imageUrl }) => {
  return (
    <div className="w-full h-full">
      <img
        src={imageUrl}
        alt="Generated Thumbnail"
        className="object-cover h-full w-full rounded-md"
      />
    </div>
  );
};