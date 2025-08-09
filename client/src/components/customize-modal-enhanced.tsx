import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, Upload, X, Plus, Minus, MessageCircle, ImageIcon, Camera, Check } from "lucide-react";
import type { Product } from "@shared/schema";

interface CustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, customization: any) => Promise<void>;
}

interface CustomImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { value: 'white', label: 'সাদা', hex: '#ffffff' },
  { value: 'black', label: 'কালো', hex: '#000000' },
  { value: 'red', label: 'লাল', hex: '#ef4444' },
  { value: 'blue', label: 'নীল', hex: '#3b82f6' },
  { value: 'green', label: 'সবুজ', hex: '#10b981' },
  { value: 'yellow', label: 'হলুদ', hex: '#f59e0b' }
];

const createWhatsAppUrl = (message: string): string => {
  const phoneNumber = "8801700000000";
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export default function CustomizeModalEnhanced({ product, isOpen, onClose, onAddToCart }: CustomizeModalProps) {
  const { toast } = useToast();
  
  // Form state
  const [customization, setCustomization] = useState({
    size: '',
    color: '',
    quantity: 1,
    instructions: '',
    specialRequests: ''
  });
  
  const [customImages, setCustomImages] = useState<CustomImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDirectOrder, setShowDirectOrder] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCustomization({
        size: '',
        color: '',
        quantity: 1,
        instructions: '',
        specialRequests: ''
      });
      setCustomImages([]);
      setShowDirectOrder(false);
    }
  }, [isOpen]);

  if (!product) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Check if total files exceed 10
    if (customImages.length + files.length > 10) {
      toast({
        title: "সর্বোচ্চ ১০টি ছবি",
        description: "একবারে সর্বোচ্চ ১০টি ছবি আপলোড করা যাবে",
        variant: "destructive",
      });
      return;
    }

    let processedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach((file, index) => {
      // Enhanced file validation
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ফাইল খুব বড়",
          description: `${file.name} - ৫MB এর কম সাইজের ছবি আপলোড করুন`,
          variant: "destructive",
        });
        return;
      }

      // More comprehensive image type checking
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        toast({
          title: "অবৈধ ফাইল টাইপ",
          description: `${file.name} - শুধুমাত্র JPEG, PNG, WebP, GIF ছবি আপলোড করুন`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          if (!result) {
            console.error('Failed to read file:', file.name);
            return;
          }

          const newImage: CustomImageFile = {
            id: `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: result,
            name: file.name
          };
          
          setCustomImages(prev => {
            const updated = [...prev, newImage];
            console.log(`📁 Image uploaded: ${file.name} (${Math.round(file.size / 1024)}KB)`);
            return updated;
          });

          processedCount++;
          if (processedCount === totalFiles) {
            toast({
              title: "ছবি আপলোড সম্পন্ন",
              description: `${totalFiles}টি ছবি সফলভাবে আপলোড হয়েছে`,
            });
          }
        } catch (error) {
          console.error('Error processing image:', error);
          toast({
            title: "ছবি প্রক্রিয়া করতে সমস্যা",
            description: `${file.name} আপলোড করতে সমস্যা হয়েছে`,
            variant: "destructive",
          });
        }
      };

      reader.onerror = () => {
        console.error('FileReader error for:', file.name);
        toast({
          title: "ফাইল পড়তে সমস্যা",
          description: `${file.name} পড়তে সমস্যা হয়েছে`,
          variant: "destructive",
        });
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removeImage = (imageId: string) => {
    setCustomImages(prev => prev.filter(img => img.id !== imageId));
  };

  const convertImagesToBase64 = async (images: CustomImageFile[]): Promise<string[]> => {
    return Promise.all(
      images.map(img => {
        return new Promise<string>((resolve) => {
          resolve(img.preview);
        });
      })
    );
  };

  const calculateTotal = () => {
    const basePrice = Number(product.price) || 0;
    const customizationFee = customImages.length * 50; // 50 taka per custom image
    return (basePrice + customizationFee) * customization.quantity;
  };

  const handleAddToCart = async () => {
    if (!customization.size) {
      toast({
        title: "সাইজ নির্বাচন করুন",
        description: "পণ্যের সাইজ নির্বাচন করা আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    if (!customization.color) {
      toast({
        title: "রং নির্বাচন করুন", 
        description: "পণ্যের রং নির্বাচন করা আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert images to base64
      const imageData = await convertImagesToBase64(customImages);
      
      const customizationData = {
        ...customization,
        customImages: imageData,
        hasCustomImages: customImages.length > 0,
        imageCount: customImages.length,
        totalPrice: calculateTotal()
      };

      await onAddToCart(product, customizationData);
      
      toast({
        title: "কার্টে যোগ হয়েছে!",
        description: "পণ্যটি সফলভাবে কার্টে যোগ করা হয়েছে",
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "ত্রুটি",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectOrder = async () => {
    if (!customization.size || !customization.color) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "সাইজ ও রং নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert images to base64
      const imageData = await convertImagesToBase64(customImages);
      
      const orderData = {
        productId: product.id,
        productName: product.name,
        productPrice: Number(product.price),
        quantity: customization.quantity,
        selectedSize: customization.size,
        selectedColor: customization.color,
        customImages: imageData,
        instructions: customization.instructions,
        specialRequests: customization.specialRequests,
        hasCustomImages: customImages.length > 0,
        imageCount: customImages.length,
        totalPrice: calculateTotal(),
        customerName: '',
        phone: '',
        email: '',
        address: ''
      };

      // Store in localStorage for the checkout page
      localStorage.setItem('pendingCustomOrder', JSON.stringify(orderData));
      
      // Create WhatsApp message
      const whatsappMessage = `🛍️ কাস্টম অর্ডার অনুরোধ

📦 পণ্য: ${product.name}
💰 মূল্য: ${formatPrice(Number(product.price))}
📏 সাইজ: ${customization.size}
🎨 রং: ${COLORS.find(c => c.value === customization.color)?.label}
🔢 পরিমাণ: ${customization.quantity}
💵 মোট: ${formatPrice(calculateTotal())}

${customization.instructions ? `📝 নির্দেশনা: ${customization.instructions}` : ''}
${customization.specialRequests ? `⭐ বিশেষ অনুরোধ: ${customization.specialRequests}` : ''}
${customImages.length > 0 ? `🖼️ কাস্টম ছবি: ${customImages.length}টি আপলোড করা হয়েছে` : ''}

অর্ডার করতে চাই!`;

      window.open(createWhatsAppUrl(whatsappMessage), '_blank');
      
      toast({
        title: "WhatsApp এ পাঠানো হয়েছে!",
        description: "আপনার অর্ডারের তথ্য WhatsApp এ পাঠানো হয়েছে",
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating direct order:', error);
      toast({
        title: "ত্রুটি",
        description: "অর্ডার তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {product.name} - কাস্টমাইজ করুন
          </DialogTitle>
          <DialogDescription>
            আপনার পছন্দ অনুযায়ী পণ্যটি কাস্টমাইজ করুন
          </DialogDescription>
        </DialogHeader>

        <div className="form-grid">
          {/* Left Column - Product Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">পণ্যের বিবরণ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(Number(product.price))}</p>
                  {product.description && (
                    <p className="text-gray-600 mt-2">{product.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">মূল্য বিভাজন</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>বেস প্রাইস × {customization.quantity}:</span>
                  <span>{formatPrice(Number(product.price) * customization.quantity)}</span>
                </div>
                {customImages.length > 0 && (
                  <div className="flex justify-between">
                    <span>কাস্টমাইজেশন ({customImages.length} ছবি):</span>
                    <span>{formatPrice(customImages.length * 50 * customization.quantity)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>মোট:</span>
                  <span className="text-blue-600">{formatPrice(calculateTotal())}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Customization Options */}
          <div className="space-y-4">
            {/* Size Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">সাইজ নির্বাচন করুন</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((size) => (
                    <Button
                      key={size}
                      variant={customization.size === size ? "default" : "outline"}
                      onClick={() => setCustomization(prev => ({ ...prev, size }))}
                      className="h-12"
                    >
                      {size}
                      {customization.size === size && <Check className="w-4 h-4 ml-1" />}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">রং নির্বাচন করুন</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {COLORS.map((color) => (
                    <Button
                      key={color.value}
                      variant={customization.color === color.value ? "default" : "outline"}
                      onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                      className="h-12 flex items-center gap-2"
                    >
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.label}
                      {customization.color === color.value && <Check className="w-4 h-4 ml-1" />}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quantity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">পরিমাণ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomization(prev => ({ 
                      ...prev, 
                      quantity: Math.max(1, prev.quantity - 1) 
                    }))}
                    disabled={customization.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-semibold w-8 text-center">
                    {customization.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomization(prev => ({ 
                      ...prev, 
                      quantity: prev.quantity + 1 
                    }))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  কাস্টম ছবি আপলোড
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="image-upload-area border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors">
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs sm:text-sm text-gray-600">ছবি আপলোড করতে ক্লিক করুন</p>
                      <p className="text-xs text-gray-500 mt-1">সর্বোচ্চ ৫MB, সর্বোচ্চ ১০টি ছবি</p>
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {customImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">আপলোড করা ছবি ({customImages.length}):</p>
                    <div className="image-preview-grid">
                      {customImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(image.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">বিশেষ নির্দেশনা</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="instructions">কাস্টমাইজেশন নির্দেশনা</Label>
                  <Textarea
                    id="instructions"
                    placeholder="আপনার কাস্টমাইজেশনের বিস্তারিত লিখুন..."
                    value={customization.instructions}
                    onChange={(e) => setCustomization(prev => ({ 
                      ...prev, 
                      instructions: e.target.value 
                    }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="special-requests">বিশেষ অনুরোধ</Label>
                  <Textarea
                    id="special-requests"
                    placeholder="কোন বিশেষ অনুরোধ থাকলে লিখুন..."
                    value={customization.specialRequests}
                    onChange={(e) => setCustomization(prev => ({ 
                      ...prev, 
                      specialRequests: e.target.value 
                    }))}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={handleAddToCart}
            disabled={isSubmitting || !customization.size || !customization.color}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isSubmitting ? "যোগ করা হচ্ছে..." : "কার্টে যোগ করুন"}
          </Button>
          
          <Button
            onClick={handleDirectOrder}
            disabled={isSubmitting || !customization.size || !customization.color}
            variant="outline"
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? "প্রেরণ করা হচ্ছে..." : "সরাসরি অর্ডার করুন"}
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            disabled={isSubmitting}
          >
            বাতিল
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}