import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { X, Upload as UploadIcon, ImagePlus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface CustomizationData {
  color?: string;
  size?: string;
  text?: string;
  instructions?: string;
  uploadedImages?: string[];
}

interface SimpleCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onCustomize: (customization: CustomizationData, quantity: number) => void;
}

const SimpleCustomizeModal: React.FC<SimpleCustomizeModalProps> = ({
  isOpen,
  onClose,
  product,
  onCustomize
}) => {
  const [customization, setCustomization] = useState<CustomizationData>({});
  const [quantity, setQuantity] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = useCallback(() => {
    setCustomization({});
    setQuantity(1);
    setUploadedImages([]);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`ফাইল ${file.name} অনেক বড় (৫MB এর বেশি)`);
          continue;
        }

        // Convert to base64 for simple storage
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
      }

      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      setCustomization(prev => ({
        ...prev,
        uploadedImages: updatedImages
      }));
    } catch (error) {
      console.error('Image upload error:', error);
      alert('ছবি আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages]);

  const handleRemoveImage = useCallback((index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    setCustomization(prev => ({
      ...prev,
      uploadedImages: updatedImages
    }));
  }, [uploadedImages]);

  const handleSubmit = useCallback(() => {
    const finalCustomization = {
      ...customization,
      uploadedImages: uploadedImages
    };
    onCustomize(finalCustomization, quantity);
    onClose();
  }, [customization, uploadedImages, quantity, onCustomize, onClose]);

  const updateCustomization = useCallback((key: keyof CustomizationData, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-bold">
            {product.name} কাস্টমাইজ করুন
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Product Info */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-green-600 font-bold">৳{product.price}</p>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label htmlFor="color">রং নির্বাচন করুন</Label>
            <Input
              id="color"
              placeholder="যেমন: লাল, নীল, সাদা"
              value={customization.color || ''}
              onChange={(e) => updateCustomization('color', e.target.value)}
            />
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label htmlFor="size">সাইজ নির্বাচন করুন</Label>
            <Input
              id="size"
              placeholder="যেমন: S, M, L, XL"
              value={customization.size || ''}
              onChange={(e) => updateCustomization('size', e.target.value)}
            />
          </div>

          {/* Custom Text */}
          <div className="space-y-2">
            <Label htmlFor="text">কাস্টম টেক্সট (ঐচ্ছিক)</Label>
            <Input
              id="text"
              placeholder="যেমন: নাম, বার্তা"
              value={customization.text || ''}
              onChange={(e) => updateCustomization('text', e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>ডিজাইনের ছবি আপলোড করুন (ঐচ্ছিক)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 text-center">
                  {isUploading ? 'আপলোড হচ্ছে...' : 'ছবি নির্বাচন করুন'}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  সর্বোচ্চ ৫MB
                </span>
              </label>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">বিশেষ নির্দেশনা (ঐচ্ছিক)</Label>
            <Textarea
              id="instructions"
              placeholder="আপনার বিশেষ কোন চাহিদা লিখুন..."
              className="min-h-[80px]"
              value={customization.instructions || ''}
              onChange={(e) => updateCustomization('instructions', e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">পরিমাণ</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              বাতিল
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? 'আপলোড হচ্ছে...' : 'অর্ডার করুন'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCustomizeModal;