import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Loader2, Upload, X, Plus, Minus, ShoppingCart, Eye, EyeOff, Sparkles, Gift, Palette } from 'lucide-react';
import type { Product } from '@shared/schema';

interface CustomizationOption {
  id: string;
  name: string;
  nameBengali: string;
  description?: string;
  options: Array<{
    value: string;
    label: string;
    labelBengali: string;
    price: number;
    description?: string;
  }>;
}

interface ImprovedCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart?: (customizedProduct: any) => void;
}

const MOCK_CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  {
    id: 'color',
    name: 'Color',
    nameBengali: 'রঙ',
    description: 'আপনার পছন্দের রঙ বেছে নিন',
    options: [
      { value: 'red', label: 'Red', labelBengali: 'লাল', price: 0 },
      { value: 'blue', label: 'Blue', labelBengali: 'নীল', price: 50 },
      { value: 'green', label: 'Green', labelBengali: 'সবুজ', price: 50 },
      { value: 'gold', label: 'Gold', labelBengali: 'সোনালি', price: 100 }
    ]
  },
  {
    id: 'material',
    name: 'Material',
    nameBengali: 'উপাদান',
    description: 'উপাদান নির্বাচন করুন',
    options: [
      { value: 'standard', label: 'Standard', labelBengali: 'সাধারণ', price: 0 },
      { value: 'premium', label: 'Premium', labelBengali: 'প্রিমিয়াম', price: 200 },
      { value: 'luxury', label: 'Luxury', labelBengali: 'বিলাসবহুল', price: 500 }
    ]
  }
];

const ImprovedCustomizeModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart
}: ImprovedCustomizeModalProps) => {
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
  const [currentStep, setCurrentStep] = useState(1);

  // useRef hooks
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use mock customization options or product's options
  const customizationOptions = product.customizationOptions || MOCK_CUSTOMIZATION_OPTIONS;

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    let totalPrice = parseFloat(product.price.toString()) || 0;

    // Add price for selected options
    Object.keys(selectedOptions).forEach(optionId => {
      const option = customizationOptions.find(opt => opt.id === optionId);
      if (option) {
        const selectedOptionValue = option.options.find(optValue => optValue.value === selectedOptions[optionId]);
        if (selectedOptionValue) {
          totalPrice += selectedOptionValue.price || 0;
        }
      }
    });

    // Add engraving cost if applicable
    if (engravingText.trim()) {
      totalPrice += 100; // Fixed engraving cost
    }

    return totalPrice * quantity;
  }, [selectedOptions, product, engravingText, quantity, customizationOptions]);

  const totalPrice = calculateTotalPrice();
  const basePrice = parseFloat(product.price.toString()) || 0;
  const customizationCost = totalPrice - (basePrice * quantity);

  const handleOptionChange = useCallback((optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
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
  }, [toast]);

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
    setCurrentStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    toast({ 
      title: "কাস্টমাইজড পণ্য যোগ করা হয়েছে!", 
      description: `${product.name} আপনার পছন্দমত কাস্টমাইজ করে কার্টে যোগ করা হয়েছে।`
    });
    onClose();
    setIsLoading(false);
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return customizationOptions.every(option => selectedOptions[option.id]);
      case 2:
        return true; // Text customization is optional
      case 3:
        return quantity > 0;
      default:
        return false;
    }
  };

  const steps = [
    { number: 1, title: "বিকল্প নির্বাচন", icon: Palette },
    { number: 2, title: "টেক্সট কাস্টমাইজেশন", icon: Gift },
    { number: 3, title: "পর্যালোচনা ও অর্ডার", icon: ShoppingCart }
  ];

  if (!product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-none h-full max-h-none m-0 p-0 rounded-none border-0 bg-white overflow-hidden flex flex-col md:max-w-7xl md:max-h-[95vh] md:m-6 md:rounded-xl md:border">
        
        {/* Header */}
        <DialogHeader className="flex-shrink-0 border-b pb-4 px-6 pt-6 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {product.name} কাস্টমাইজ করুন
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  আপনার পছন্দ অনুযায়ী পণ্যটি সাজিয়ে নিন
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0 hover:bg-red-100"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  currentStep === step.number 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : currentStep > step.number
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  <span className="text-sm font-bold sm:hidden">{step.number}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Left Column - Product Preview */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="overflow-hidden sticky top-6">
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
                      className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      {showPreview ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    {/* Customization Preview Overlay */}
                    {showPreview && (customText || engravingText || Object.keys(selectedOptions).length > 0) && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 m-4 text-center">
                          <h4 className="font-semibold text-gray-900 mb-2">কাস্টমাইজেশন প্রিভিউ</h4>
                          {customText && <p className="text-sm text-gray-700">টেক্সট: "{customText}"</p>}
                          {engravingText && <p className="text-sm text-gray-700">খোদাই: "{engravingText}"</p>}
                          {Object.keys(selectedOptions).length > 0 && (
                            <div className="mt-2">
                              {Object.entries(selectedOptions).map(([key, value]) => {
                                const option = customizationOptions.find(opt => opt.id === key);
                                const selectedValue = option?.options.find(opt => opt.value === value);
                                return selectedValue && (
                                  <Badge key={key} variant="secondary" className="mr-1 mb-1 text-xs">
                                    {selectedValue.labelBengali}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">বেস প্রাইস:</span>
                        <span className="font-medium">৳{(basePrice * quantity).toFixed(2)}</span>
                      </div>
                      {customizationCost > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">কাস্টমাইজেশন:</span>
                          <span className="font-medium text-orange-600">৳{customizationCost.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold">মোট:</span>
                        <span className="text-xl font-bold text-orange-600">৳{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Customization Steps */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Step 1: Option Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">ধাপ ১: বিকল্প নির্বাচন করুন</h3>
                    
                    {customizationOptions.map((option) => (
                      <Card key={option.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{option.nameBengali}</CardTitle>
                          {option.description && (
                            <p className="text-sm text-gray-600">{option.description}</p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <RadioGroup
                            value={selectedOptions[option.id] || ''}
                            onValueChange={(value) => handleOptionChange(option.id, value)}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {option.options.map((opt) => (
                                <div key={opt.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                  <RadioGroupItem value={opt.value} id={`${option.id}-${opt.value}`} />
                                  <Label 
                                    htmlFor={`${option.id}-${opt.value}`} 
                                    className="flex-1 cursor-pointer"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">{opt.labelBengali}</span>
                                      {opt.price > 0 && (
                                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                                          +৳{opt.price}
                                        </Badge>
                                      )}
                                    </div>
                                    {opt.description && (
                                      <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                                    )}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setCurrentStep(2)}
                        disabled={!isStepComplete(1)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        পরবর্তী ধাপ
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Text Customization */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">ধাপ ২: টেক্সট কাস্টমাইজেশন</h3>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">কাস্টম টেক্সট</CardTitle>
                        <p className="text-sm text-gray-600">পণ্যে আপনার পছন্দের লেখা যোগ করুন</p>
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

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">খোদাই টেক্সট</CardTitle>
                        <p className="text-sm text-gray-600">খোদাই করার জন্য টেক্সট (অতিরিক্ত ৳১০০)</p>
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

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">বিশেষ নির্দেশনা</CardTitle>
                        <p className="text-sm text-gray-600">অন্যান্য কোনো বিশেষ অনুরোধ</p>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                          rows={3}
                          className="w-full"
                        />
                      </CardContent>
                    </Card>

                    {/* Image Upload */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">ছবি আপলোড</CardTitle>
                        <p className="text-sm text-gray-600">রেফারেন্স ছবি আপলোড করুন</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
                          >
                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">ছবি আপলোড করুন</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG (সর্বোচ্চ ৫MB)</p>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />

                          {uploadedImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {uploadedImages.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={image}
                                    alt={`আপলোড ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border"
                                  />
                                  <button
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        পূর্ববর্তী
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep(3)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        পরবর্তী ধাপ
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review and Order */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">ধাপ ৩: পর্যালোচনা ও অর্ডার</h3>
                    
                    {/* Quantity Selection */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">পরিমাণ</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-xl font-semibold min-w-12 text-center">{quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">অর্ডার সারসংক্ষেপ</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">নির্বাচিত অপশন:</h4>
                          {Object.entries(selectedOptions).map(([key, value]) => {
                            const option = customizationOptions.find(opt => opt.id === key);
                            const selectedValue = option?.options.find(opt => opt.value === value);
                            return selectedValue && (
                              <div key={key} className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm">{option?.nameBengali}: {selectedValue.labelBengali}</span>
                                <span className="text-sm font-medium">
                                  {selectedValue.price > 0 ? `+৳${selectedValue.price}` : 'ফ্রি'}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {(customText || engravingText || specialInstructions) && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">টেক্সট কাস্টমাইজেশন:</h4>
                            {customText && <p className="text-sm">কাস্টম টেক্সট: "{customText}"</p>}
                            {engravingText && <p className="text-sm">খোদাই: "{engravingText}" (+৳১০০)</p>}
                            {specialInstructions && <p className="text-sm">বিশেষ নির্দেশনা: "{specialInstructions}"</p>}
                          </div>
                        )}

                        {uploadedImages.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">আপলোড করা ছবি:</h4>
                            <p className="text-sm text-gray-600">{uploadedImages.length} টি ছবি আপলোড করা হয়েছে</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                      >
                        পূর্ববর্তী
                      </Button>
                      <Button 
                        onClick={handleAddToCart}
                        disabled={isLoading}
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-8"
                      >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        কার্টে যোগ করুন (৳{totalPrice.toFixed(2)})
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImprovedCustomizeModal;