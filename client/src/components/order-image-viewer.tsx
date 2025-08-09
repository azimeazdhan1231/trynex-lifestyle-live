import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Download, X } from "lucide-react";

interface OrderImageViewerProps {
  images: any[];
  onImageClick?: (imageUrl: string, index: number) => void;
}

export function OrderImageViewer({ images, onImageClick }: OrderImageViewerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const processImage = (image: any): string | null => {
    if (!image) return null;
    
    // Handle different image formats
    if (typeof image === 'string') {
      return image;
    }
    
    if (image && typeof image === 'object') {
      // Check for various possible properties
      const imageUrl = image.url || image.dataUrl || image.data || image.src || '';
      return imageUrl;
    }
    
    return null;
  };

  const validImages = images
    .map((image, index) => ({ image, index, url: processImage(image) }))
    .filter(item => item.url);

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    if (onImageClick) {
      const item = validImages[index];
      onImageClick(item.url!, item.index);
    }
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const downloadImage = (url: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  if (validImages.length === 0) {
    return (
      <div className="text-center py-8">
        <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">কোন বৈধ ছবি পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {validImages.map((item, index) => (
          <div key={index} className="relative group">
            <img 
              src={item.url!}
              alt={`কাস্টম ছবি ${index + 1}`}
              className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => openImageModal(index)}
              onError={(e) => {
                console.error('Image failed to load:', item.url);
                e.currentTarget.style.display = 'none';
              }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="p-2 h-8 w-8 bg-white/90 hover:bg-white"
                  onClick={() => openImageModal(index)}
                  data-testid={`view-image-${index}`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="p-2 h-8 w-8 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(item.url!, `custom-image-${index + 1}.jpg`);
                  }}
                  data-testid={`download-image-${index}`}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Image Modal */}
      {selectedImageIndex !== null && (
        <Dialog open={true} onOpenChange={closeImageModal}>
          <DialogContent 
            className="w-[98vw] max-w-5xl max-h-[98vh] p-0 overflow-hidden"
            data-testid="image-fullscreen-modal"
          >
            <div className="relative w-full h-full flex items-center justify-center bg-black/95">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
                data-testid="close-fullscreen"
              >
                <X className="h-5 w-5" />
              </Button>

              <img 
                src={validImages[selectedImageIndex].url!}
                alt={`কাস্টম ছবি ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error('Full screen image failed to load');
                  closeImageModal();
                }}
              />

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-2 bg-black/50 p-2 rounded-lg">
                  {validImages.length > 1 && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedImageIndex(
                          selectedImageIndex > 0 ? selectedImageIndex - 1 : validImages.length - 1
                        )}
                        className="text-white hover:bg-white/20"
                        disabled={validImages.length <= 1}
                      >
                        পূর্ববর্তী
                      </Button>
                      <span className="text-white px-3 py-1 text-sm">
                        {selectedImageIndex + 1} / {validImages.length}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedImageIndex(
                          selectedImageIndex < validImages.length - 1 ? selectedImageIndex + 1 : 0
                        )}
                        className="text-white hover:bg-white/20"
                        disabled={validImages.length <= 1}
                      >
                        পরবর্তী
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadImage(
                      validImages[selectedImageIndex].url!, 
                      `custom-image-${selectedImageIndex + 1}.jpg`
                    )}
                    className="text-white hover:bg-white/20"
                    data-testid="download-fullscreen"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ডাউনলোড
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}