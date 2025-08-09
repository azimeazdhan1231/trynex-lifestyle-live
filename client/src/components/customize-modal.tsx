
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: string | number;
  image_url?: string;
  category?: string;
  description?: string;
  stock?: number;
}

interface CustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `৳${numPrice.toFixed(0)}`;
};

export default function CustomizeModal({ product, isOpen, onClose }: CustomizeModalProps) {
  const [customImages, setCustomImages] = useState<File[]>([]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('white');
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen && product) {
      setCustomImages([]);
      setSelectedSize('M');
      setSelectedColor('white');
    }
  }, [isOpen, product]);

  if (!product) return null;

  const sizes = [
    { value: 'XS', label: 'XS', available: true },
    { value: 'S', label: 'S (ছোট)', available: true },
    { value: 'M', label: 'M (মাঝারি)', available: true },
    { value: 'L', label: 'L (বড়)', available: true },
    { value: 'XL', label: 'XL', available: true },
    { value: 'XXL', label: 'XXL', available: true }
  ];

  const colors = [
    { value: 'white', label: 'সাদা', hex: '#ffffff', available: true },
    { value: 'black', label: 'কালো', hex: '#000000', available: true },
    { value: 'red', label: 'লাল', hex: '#ef4444', available: true },
    { value: 'blue', label: 'নীল', hex: '#3b82f6', available: true },
    { value: 'green', label: 'সবুজ', hex: '#10b981', available: true },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - customImages.length);
      setCustomImages([...customImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setCustomImages(customImages.filter((_, i) => i !== index));
  };

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      
      const customizationPrice = customImages.length * 100;
      const totalPrice = (typeof product.price === 'string' ? parseFloat(product.price) : product.price) + customizationPrice;

      const cartItem = {
        id: `${product.id}-custom-${Date.now()}`,
        name: `${product.name} (কাস্টমাইজড)`,
        price: totalPrice,
        image_url: product.image_url || '/placeholder.jpg',
        quantity: 1,
        customization: {
          size: selectedSize,
          color: selectedColor,
          images: customImages.length,
          isCustom: true
        }
      };

      addToCart(cartItem);
      
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Error adding customized product to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const customizationPrice = customImages.length * 100;
    const totalPrice = (typeof product.price === 'string' ? parseFloat(product.price) : product.price) + customizationPrice;
    
    const message = `আমি একটি কাস্টমাইজড পণ্য অর্ডার করতে চাই:\n\nপণ্যের নাম: ${product.name}\nমূল দাম: ${formatPrice(product.price)}\nসাইজ: ${selectedSize}\nরং: ${colors.find(c => c.value === selectedColor)?.label}\nকাস্টম ছবি: ${customImages.length}টি\nকাস্টমাইজেশন ফি: ${formatPrice(customizationPrice)}\nমোট দাম: ${formatPrice(totalPrice)}\n\nদয়া করে অর্ডারটি কনফার্ম করুন।`;
    const phoneNumber = '8801521334956';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "p-0 gap-0 overflow-hidden",
        // Perfect responsive sizing  
        "w-[95vw] max-h-[90vh]",
        "sm:w-[90vw] sm:max-w-[700px]",
        "md:w-[85vw] md:max-w-[800px]",
        "lg:w-[80vw] lg:max-w-[900px]", 
        "xl:w-[70vw] xl:max-w-[1000px]",
        "2xl:max-w-[1100px]",
        // Perfect styling
        "border-0 shadow-2xl rounded-xl bg-white dark:bg-gray-900"
      )}>
        <div className="flex flex-col h-full max-h-[inherit] overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-4 sm:p-6 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pr-8">
                {product.name} কাস্টমাইজ করুন
              </DialogTitle>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
              {/* Left Column - Customization Options */}
              <div className="space-y-6">
                {/* Image Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">আপনার ছবি আপলোড করুন</CardTitle>
                    <p className="text-sm text-gray-600">সর্বোচ্চ ৫টি ছবি (প্রতিটি ছবির জন্য ৳১০০ অতিরিক্ত)</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {customImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`কাস্টম ছবি ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {customImages.length < 5 && (
                          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                            <div className="text-center">
                              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">ছবি যোগ করুন</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Size Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">সাইজ নির্বাচন করুন</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {sizes.map((size) => (
                        <Button
                          key={size.value}
                          variant={selectedSize === size.value ? "default" : "outline"}
                          className={cn(
                            "h-12 text-sm",
                            selectedSize === size.value && "bg-orange-600 hover:bg-orange-700",
                            !size.available && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={!size.available}
                          onClick={() => setSelectedSize(size.value)}
                        >
                          {size.label}
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
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          className={cn(
                            "p-3 rounded-lg border-2 text-sm transition-all",
                            selectedColor === color.value 
                              ? "border-orange-500 bg-orange-50" 
                              : "border-gray-200 hover:border-gray-300",
                            !color.available && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={!color.available}
                          onClick={() => setSelectedColor(color.value)}
                        >
                          <div 
                            className="w-8 h-8 rounded-full mx-auto mb-2 border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview & Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={product.image_url || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>মূল দাম:</span>
                        <span className="font-medium">{formatPrice(Number(product.price))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>কাস্টমাইজেশন ({customImages.length} ছবি):</span>
                        <span className="font-medium">{formatPrice(customImages.length * 100)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-lg font-bold">
                        <span>মোট দাম:</span>
                        <span className="text-orange-600">
                          {formatPrice(Number(product.price) + (customImages.length * 100))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Options Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">নির্বাচিত অপশনসমূহ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>সাইজ:</span>
                      <Badge variant="outline">{selectedSize}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>রং:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: colors.find(c => c.value === selectedColor)?.hex }}
                        />
                        <span>{colors.find(c => c.value === selectedColor)?.label}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>কাস্টম ছবি:</span>
                      <Badge variant="secondary">{customImages.length}টি</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    কার্টে যোগ করুন
                  </Button>

                  <Button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    WhatsApp এ অর্ডার করুন
                  </Button>
                </div>

                {/* Instructions */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">নির্দেশনা:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• ছবি স্পষ্ট এবং উচ্চ মানের হতে হবে</li>
                      <li>• প্রিন্টের মান ছবির গুণমানের উপর নির্ভর করে</li>
                      <li>• কাস্টমাইজেশনে ২-৩ দিন অতিরিক্ত সময় লাগতে পারে</li>
                      <li>• কাস্টমাইজড পণ্য রিটার্ন যোগ্য নয়</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
