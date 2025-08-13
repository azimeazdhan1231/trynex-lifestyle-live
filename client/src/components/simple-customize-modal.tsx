import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Plus, Minus, ShoppingCart, Eye, EyeOff } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
}

interface CustomizationOption {
  id: string;
  name: string;
  nameBengali: string;
  options: Array<{
    value: string;
    label: string;
    labelBengali: string;
    price: number;
    description?: string;
  }>;
}

interface SimpleCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart?: (customizedProduct: any) => void;
}

const SimpleCustomizeModal: React.FC<SimpleCustomizeModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart
}) => {
  const { toast } = useToast();
  
  // All useState hooks must be at the top level and in consistent order
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState('');
  const [engravingText, setEngravingText] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);

  // useRef hooks
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    let totalPrice = parseFloat(product.price.toString()) || 0;

    // Add price for selected options
    Object.keys(selectedOptions).forEach(optionId => {
      const option = product.customizationOptions?.find(opt => opt.id === optionId);
      if (option) {
        const selectedOptionValue = option.options.find(optValue => optValue.value === selectedOptions[optionId]);
        if (selectedOptionValue) {
          totalPrice += selectedOptionValue.price || 0;
        }
      }
    });

    // Add price for engraving text if applicable (example, adjust logic as needed)
    if (engravingText) {
      // Assuming a fixed price for engraving, or calculate based on length etc.
      // totalPrice += 50; // Example fixed price
    }

    return totalPrice;
  }, [selectedOptions, product, engravingText]);

  const customizationCost = product.customizationOptions?.reduce((acc, option) => {
    const selectedValue = selectedOptions[option.id];
    if (selectedValue) {
      const selectedOption = option.options.find(opt => opt.value === selectedValue);
      return acc + (selectedOption?.price || 0);
    }
    return acc;
  }, 0) || 0;

  const totalPrice = calculateTotalPrice();


  const handleOptionChange = useCallback((optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true); // Use isLoading for overall loading state
    const newImageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "ফাইল সাইজ সীমা",
          description: `${file.name} ফাইলটি ৫MB এর বেশি।`,
          variant: "destructive",
        });
        continue;
      }

      try {
        // In a real app, you'd upload to a cloud storage and get a URL
        // For this example, we'll use FileReader to display as data URL
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error("Could not read file."));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newImageUrls.push(base64Data);
      } catch (error) {
        console.error("Image upload failed:", error);
        toast({
          title: "আপলোড ব্যর্থ",
          description: `"${file.name}" আপলোড করা যায়নি।`,
          variant: "destructive",
        });
      }
    }

    setUploadedImages(prevImages => [...prevImages, ...newImageUrls]);
    setIsLoading(false);
  }, []);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prevImages => prevImages.filter((_, i) => i !== index));
  }, []);

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const resetForm = useCallback(() => {
    setSelectedOptions({});
    setQuantity(1);
    setCustomText('');
    setEngravingText('');
    setSpecialInstructions('');
    setUploadedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleAddToCart = () => {
    if (!product || !onAddToCart) return;

    setIsLoading(true);
    const customizedProduct = {
      productId: product.id,
      name: product.name,
      quantity: quantity,
      price: totalPrice,
      customizations: {
        selectedOptions: selectedOptions,
        customText: customText,
        engravingText: engravingText,
        specialInstructions: specialInstructions,
        uploadedImages: uploadedImages,
      },
    };

    onAddToCart(customizedProduct);
    // Consider showing a toast here if needed, or let the parent handle it.
    // toast({ title: "পণ্য কার্টে যোগ করা হয়েছে" });
    onClose(); // Close modal after adding to cart
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-none h-full max-h-none m-0 p-0 rounded-none border-0 bg-white overflow-hidden flex flex-col md:max-w-6xl md:max-h-[95vh] md:m-6 md:rounded-lg md:border">
        <DialogHeader className="flex-shrink-0 border-b pb-4 px-6 pt-6">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {product.name} কাস্টমাইজ করুন
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            আপনার পছন্দ অনুযায়ী পণ্যটি সাজিয়ে নিন এবং দেখুন কেমন লাগছে
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 rounded-full p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-3 py-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              {/* Left Column - Product Preview */}
              <div className="space-y-4 md:space-y-6">
                {/* Product Image & Preview */}
                <Card className="overflow-hidden">
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart size={64} />
                      </div>
                    )}

                    {/* Preview Toggle */}
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="absolute top-2 right-2 md:top-4 md:right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      {showPreview ? <Eye size={16} className="md:w-5 md:h-5" /> : <EyeOff size={16} className="md:w-5 md:h-5" />}
                    </button>
                  </div>
                </Card>

                {/* Customizable Options - Render dynamically */}
                {product.customizationOptions?.map((option) => (
                  <Card key={option.id}>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">{option.nameBengali} ({option.name})</CardTitle>
                      {option.description && <p className="text-xs text-gray-500">{option.description}</p>}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {option.options.map((opt) => (
                          <div key={opt.value} className="flex items-center space-x-3">
                            <RadioGroup
                              defaultValue={selectedOptions[option.id] || opt.value}
                              onValueChange={(value) => handleOptionChange(option.id, value)}
                              className="flex items-center space-x-3"
                            >
                              <RadioGroupItem value={opt.value} id={`${option.id}-${opt.value}`} />
                              <Label htmlFor={`${option.id}-${opt.value}`} className="flex-1 cursor-pointer">
                                {opt.labelBengali} ({opt.label})
                                {opt.price > 0 && (
                                  <span className="text-xs text-gray-500 ml-2">(+ {opt.price} ৳)</span>
                                )}
                                {opt.description && <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>}
                              </Label>
                            </RadioGroup>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}


                {/* Image Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">ছবি আপলোড করুন</CardTitle>
                    <p className="text-xs md:text-sm text-gray-600">আপনার পছন্দের ডিজাইন বা ছবি আপলোড করুন</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Upload Button */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                      >
                        <Upload size={24} className="md:w-8 md:h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-xs md:text-sm font-medium text-gray-700">ছবি আপলোড করতে ক্লিক করুন</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (সর্বোচ্চ ৫ এমবি)</p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {/* Uploaded Images */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`আপলোড ${index + 1}`}
                                className="w-full h-20 md:h-24 object-cover rounded-lg border"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} className="md:w-4 md:h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Details & Actions */}
              <div className="space-y-6">
                {/* Product Description */}
                {product.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base md:text-lg">পণ্যের বিবরণ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Custom Text Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">কাস্টম টেক্সট</CardTitle>
                    <p className="text-xs text-gray-500">পণ্যে আপনার পছন্দের লেখা যোগ করুন (ঐচ্ছিক)</p>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="যেমন: আপনার নাম বা বার্তা"
                      className="w-full"
                    />
                  </CardContent>
                </Card>

                {/* Engraving Text Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">খোদাই টেক্সট (Engraving)</CardTitle>
                    <p className="text-xs text-gray-500">গয়না বা অন্যান্য পণ্যে খোদাই করার জন্য টেক্সট (ঐচ্ছিক)</p>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={engravingText}
                      onChange={(e) => setEngravingText(e.target.value)}
                      placeholder="খোদাই করার জন্য টেক্সট লিখুন"
                      className="w-full"
                    />
                  </CardContent>
                </Card>

                {/* Special Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">বিশেষ নির্দেশনা</CardTitle>
                    <p className="text-xs text-gray-500">অন্যান্য কোনো বিশেষ অনুরোধ থাকলে জানান</p>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="আপনার বিশেষ নির্দেশনা..."
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>

                {/* Quantity Selector */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">পরিমাণ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-700">পরিমাণ:</p>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleQuantityChange(1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="flex-shrink-0 border-t bg-gray-50/50 p-3 md:p-6">
          <div className="flex flex-col space-y-3 md:space-y-4">
            {/* Price Summary */}
            <div className="flex justify-between items-center p-3 md:p-4 bg-white rounded-lg border">
              <div>
                <p className="text-xs md:text-sm text-gray-600">মোট:</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">
                  {totalPrice.toLocaleString()} ৳
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-gray-600">পরিমাণ: {quantity}টি</p>
                {customizationCost > 0 && (
                  <p className="text-xs text-blue-600">
                    কাস্টমাইজেশন: +{customizationCost} ৳
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 md:space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 md:h-auto text-sm md:text-base"
                disabled={isLoading}
              >
                বাতিল
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 h-12 md:h-auto text-sm md:text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    প্রসেসিং...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    কার্টে যোগ করুন
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCustomizeModal;