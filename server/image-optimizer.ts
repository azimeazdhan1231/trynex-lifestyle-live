// Image optimization utility
export function optimizeImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // If it's a data URL (base64), return as-is for now
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's a placeholder URL, add compression parameters
  if (imageUrl.includes('placeholder.com') || imageUrl.includes('via.placeholder')) {
    return imageUrl;
  }
  
  // For other URLs, add compression parameters if supported
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl.replace('/upload/', '/upload/c_fill,w_300,h_300,q_auto:low/');
  }
  
  // For general URLs, return as-is
  return imageUrl;
}

export function compressBase64Image(base64: string, maxWidth: number = 300, quality: number = 0.7): Promise<string> {
  return new Promise((resolve) => {
    if (!base64.startsWith('data:image/')) {
      resolve(base64);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}