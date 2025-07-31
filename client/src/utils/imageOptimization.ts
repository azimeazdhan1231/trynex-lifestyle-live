// Image optimization utilities for better performance
export const IMAGE_FORMATS = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  png: 'image/png'
} as const;

export const COMPRESSION_LEVELS = {
  high: 0.6,
  medium: 0.75,
  low: 0.85,
  optimal: 0.82 // Sweet spot for quality vs size
} as const;

// Check browser support for modern image formats
export const supportsImageFormat = (format: keyof typeof IMAGE_FORMATS): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL(IMAGE_FORMATS[format]).indexOf(`data:${IMAGE_FORMATS[format]}`) === 0;
  } catch {
    return false;
  }
};

// Generate optimized image URL with proper parameters
export const generateOptimizedImageUrl = (
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}
): string => {
  if (!originalUrl || originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  const { width, height, quality = 85, format } = options;
  
  try {
    const url = new URL(originalUrl);
    
    // Add optimization parameters
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    
    // Use modern format if supported
    if (format && supportsImageFormat(format)) {
      url.searchParams.set('format', format);
    } else if (supportsImageFormat('webp')) {
      url.searchParams.set('format', 'webp');
    }
    
    // Add compression flag
    url.searchParams.set('compress', 'true');
    
    return url.toString();
  } catch {
    return originalUrl;
  }
};

// Generate responsive image srcset
export const generateResponsiveSrcSet = (
  originalUrl: string,
  sizes: number[] = [480, 768, 1024, 1280]
): string => {
  return sizes
    .map(size => `${generateOptimizedImageUrl(originalUrl, { width: size })} ${size}w`)
    .join(', ');
};

// Preload critical images
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

// Batch preload images with priority
export const preloadImages = async (
  urls: string[],
  options: { priority?: 'high' | 'low'; timeout?: number } = {}
): Promise<void> => {
  const { priority = 'low', timeout = 5000 } = options;
  
  const preloadPromises = urls.map(url => {
    return Promise.race([
      preloadImage(generateOptimizedImageUrl(url, { quality: 75 })),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Preload timeout')), timeout)
      )
    ]);
  });

  try {
    await Promise.allSettled(preloadPromises);
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};

// Convert file to optimized base64 with compression
export const optimizeAndCompressImage = (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    outputFormat?: 'webp' | 'jpeg' | 'png';
  } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = COMPRESSION_LEVELS.optimal,
      outputFormat = 'webp'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate optimal dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      const format = supportsImageFormat(outputFormat) 
        ? IMAGE_FORMATS[outputFormat] 
        : IMAGE_FORMATS.jpeg;
        
      const compressedDataUrl = canvas.toDataURL(format, quality);
      resolve(compressedDataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};