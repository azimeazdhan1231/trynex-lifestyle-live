
import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = "", 
  sizes = "(max-width: 600px) 480px, 1024px",
  priority = false,
  width,
  height
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate responsive image URLs (you can integrate with your CDN here)
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.startsWith('http')) {
      // For external URLs, assume they support query parameters for resizing
      return `${baseSrc}?w=480 480w, ${baseSrc}?w=1024 1024w`;
    }
    return baseSrc;
  };

  const handleError = () => {
    setImageError(true);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  if (imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        style={{ 
          aspectRatio: width && height ? `${width}/${height}` : undefined 
        }}
      />
    </div>
  );
}
