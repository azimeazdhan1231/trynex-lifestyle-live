import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

// Image optimization utility
const optimizeImageUrl = (url: string, width?: number): string => {
  if (!url || url.startsWith('data:')) return url;
  
  // For external URLs, try to add optimization parameters
  try {
    const urlObj = new URL(url);
    
    // Add WebP format and compression for supported services
    if (width) {
      urlObj.searchParams.set('w', width.toString());
    }
    urlObj.searchParams.set('format', 'webp');
    urlObj.searchParams.set('q', '85'); // 85% quality for optimal size/quality balance
    
    return urlObj.toString();
  } catch {
    return url;
  }
};

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  sizes = "(max-width: 600px) 480px, 1024px",
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate responsive image URLs
  const srcSet = [
    `${optimizeImageUrl(src, 480)} 480w`,
    `${optimizeImageUrl(src, 1024)} 1024w`
  ].join(', ');

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (img.complete) {
      setIsLoaded(true);
    }
  }, []);

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400",
        className
      )}>
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={optimizeImageUrl(src)}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
};

export default LazyImage;