import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Star, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface EnhancedCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

interface CustomizationOption {
  type: 'size' | 'color' | 'text' | 'image' | 'material' | 'style';
  label: string;
  value: string;
  price?: number;
}

export default function EnhancedCustomizeModal({ isOpen, onClose, product }: EnhancedCustomizeModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<CustomizationOption[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [customText, setCustomText] = useState("");
  const [customImages, setCustomImages] = useState<File[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");

  // Available options based on product category
  const getAvailableOptions = () => {
    const category = product.category.toLowerCase();
    
    const baseOptions = {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['লাল', 'নীল', 'সবুজ', 'কালো', 'সাদা', 'হলুদ', 'গোলাপি', 'বেগুনি'],
      materials: ['কটন', 'পলিয়েস্টার', 'সিল্ক', 'লিনেন', 'জিন্স'],
      styles: ['ক্যাজুয়াল', 'ফরমাল', 'স্পোর্টস', 'পার্টি']
    };

    // Category-specific options
    if (category.includes('clothing') || category.includes('fashion')) {
      return {
        ...baseOptions,
        showSize: true,
        showColor: true,
        showMaterial: true,
        showStyle: true,
        showText: true,
        showImage: true
      };
    } else if (category.includes('accessory') || category.includes('jewelry')) {
      return {
        ...baseOptions,
        sizes: ['ছোট', 'মাঝারি', 'বড়'],
        showSize: true,
        showColor: true,
        showText: true,
        showImage: false
      };
    } else {
      return {
        ...baseOptions,
        showSize: false,
        showColor: true,
        showMaterial: false,
        showStyle: false,
        showText: true,
        showImage: true
      };
    }
  };

  const options = getAvailableOptions();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: "ফাইল সাইজ বড়",
          description: "ছবি ৫MB এর চেয়ে ছোট হতে হবে",
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (customImages.length + validFiles.length > 3) {
      toast({
        title: "সর্বোচ্চ ৩টি ছবি",
        description: "সর্বোচ্চ ৩টি ছবি আপলোড করা যাবে",
        variant: "destructive"
      });
      return;
    }

    setCustomImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setCustomImages(prev => prev.filter((_, i) => i !== index));
  };

  const calculateCustomizationPrice = () => {
    let additionalPrice = 0;
    
    // Add price for customizations
    if (selectedSize && ['XL', 'XXL'].includes(selectedSize)) {
      additionalPrice += 50;
    }
    if (customText) {
      additionalPrice += 100;
    }
    if (customImages.length > 0) {
      additionalPrice += customImages.length * 50;
    }
    if (selectedMaterial && ['সিল্ক', 'লিনেন'].includes(selectedMaterial)) {
      additionalPrice += 200;
    }
    
    return additionalPrice;
  };

  const totalPrice = (product.price + calculateCustomizationPrice()) * quantity;

  const handleAddToCart = () => {
    // Convert images to base64 for storage
    const processImages = async () => {
      const imagePromises = customImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      const base64Images = await Promise.all(imagePromises);
      
      const customizationData = {
        size: selectedSize,
        color: selectedColor,
        text: customText,
        images: base64Images,
        material: selectedMaterial,
        style: selectedStyle,
        specialInstructions,
        additionalPrice: calculateCustomizationPrice()
      };

      addToCart({
        ...product,
        price: product.price + calculateCustomizationPrice(),
        customization: customizationData
      }, quantity);

      toast({
        title: "কার্টে যোগ হয়েছে",
        description: `${product.name} কাস্টমাইজেশন সহ কার্টে যোগ করা হয়েছে`,
      });

      onClose();
    };

    processImages();
  };

  const handleDirectOrder = () => {
    const customizationDetails = [
      selectedSize && `সাইজ: ${selectedSize}`,
      selectedColor && `রং: ${selectedColor}`,
      selectedMaterial && `ম্যাটেরিয়াল: ${selectedMaterial}`,
      selectedStyle && `স্টাইল: ${selectedStyle}`,
      customText && `কাস্টম টেক্সট: ${customText}`,
      customImages.length > 0 && `কাস্টম ইমেজ: ${customImages.length}টি`,
      specialInstructions && `বিশেষ নির্দেশনা: ${specialInstructions}`
    ].filter(Boolean).join('\n');

    const orderMessage = `
🛍️ কাস্টম অর্ডার
📦 পণ্য: ${product.name}
💰 দাম: ${formatPrice(product.price)}
📊 কাস্টমাইজেশন চার্জ: ${formatPrice(calculateCustomizationPrice())}
💵 মোট দাম: ${formatPrice(totalPrice)}
🔢 পরিমাণ: ${quantity}

🎨 কাস্টমাইজেশন:
${customizationDetails}

অর্ডার কনফার্ম করতে চাই।
    `.trim();

    window.open(createWhatsAppUrl(orderMessage), '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            {product.name} কাস্টমাইজ করুন
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">পণ্যের তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    <span className="font-bold text-lg text-primary">{formatPrice(product.price)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Size Selection */}
            {options.showSize && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">সাইজ নির্বাচন</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="সাইজ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} {['XL', 'XXL'].includes(size) && '+৫০ টাকা'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Color Selection */}
            {options.showColor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">রং নির্বাচন</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="রং নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Material Selection */}
            {options.showMaterial && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ম্যাটেরিয়াল</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder="ম্যাটেরিয়াল নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.materials.map((material) => (
                        <SelectItem key={material} value={material}>
                          {material} {['সিল্ক', 'লিনেন'].includes(material) && '+২০০ টাকা'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Style Selection */}
            {options.showStyle && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">স্টাইল</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="স্টাইল নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.styles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Custom Text */}
          {options.showText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">কাস্টম টেক্সট (+১০০ টাকা)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="আপনার পছন্দের টেক্সট লিখুন (যেমন: নাম, বার্তা)"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    সর্বোচ্চ ৫০ অক্ষর। প্রিন্ট/এমব্রয়ডারি করা হবে।
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Images */}
          {options.showImage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">কাস্টম ইমেজ (+৫০ টাকা প্রতি ছবি)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="custom-images"
                    />
                    <label htmlFor="custom-images" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        ছবি আপলোড করুন (সর্বোচ্চ ৩টি, ৫MB এর কম)
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {customImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {customImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Custom ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">বিশেষ নির্দেশনা</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="আপনার কোনো বিশেষ চাহিদা বা নির্দেশনা থাকলে লিখুন..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Quantity and Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">পরিমাণ ও মূল্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label>পরিমাণ:</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-semibold text-lg px-4">{quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>মূল দাম:</span>
                    <span>{formatPrice(product.price)}</span>
                  </div>
                  {calculateCustomizationPrice() > 0 && (
                    <div className="flex justify-between">
                      <span>কাস্টমাইজেশন চার্জ:</span>
                      <span>+{formatPrice(calculateCustomizationPrice())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>মোট দাম:</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              কার্টে যোগ করুন
            </Button>
            <Button
              onClick={handleDirectOrder}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              সরাসরি অর্ডার করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}