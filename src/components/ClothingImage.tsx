'use client';

import { useState } from 'react';

interface ClothingImageProps {
  src?: string | null;
  category?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onUpload?: (file: File) => void;
  showUploadButton?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
};

const categoryImageMap: Record<string, string> = {
  womenswear: '/images/clothing/categories/womenswear.svg',
  menswear: '/images/clothing/categories/menswear.svg',
  childrenswear: '/images/clothing/categories/childrenswear.svg',
};

export default function ClothingImage({
  src,
  category,
  alt = 'Clothing item',
  className = '',
  size = 'md',
  onUpload,
  showUploadButton = false,
}: ClothingImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      setIsUploading(true);
      try {
        await onUpload(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Determine image source with fallback chain
  let imageSrc = '/images/clothing/placeholders/garment-placeholder.svg';
  
  if (src && !imageError) {
    imageSrc = src;
  } else if (category && categoryImageMap[category] && !imageError) {
    imageSrc = categoryImageMap[category];
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full rounded-lg border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center">
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      {showUploadButton && onUpload && (
        <label className="absolute inset-0 flex items-center justify-center bg-slate-900/80 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <span className="text-xs text-slate-200 bg-slate-800 px-2 py-1 rounded">
            {isUploading ? 'Uploading...' : 'Upload'}
          </span>
        </label>
      )}
    </div>
  );
}

