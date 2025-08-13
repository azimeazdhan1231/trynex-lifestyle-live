import { useState, useRef, useCallback } from "react";
import PerfectResponsiveModal from "./perfect-responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Shirt, 
  Package,
  Plus,
  Minus,
  X,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Sparkles,
  Zap,
  Crown,
  Heart,
  Star,
  RotateCcw,
  Download,
  Eye,
  Settings,
  Layers,
  Move3D,
  Paintbrush,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  price: number | string;
  image_url?: string | null;
  description?: string | null;
  category?: string | null;
  stock?: number;
  is_featured?: boolean | null;
  is_latest?: boolean | null;
  is_best_selling?: boolean | null;
  created_at?: Date | null;
}

interface UltraProfessionalCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: any, customization: any) => Promise<void>;
  onDirectOrder?: (product: any, customization: any) => Promise<void>;
}

interface CustomizationData {
  color: string;
  colorName: string;
  size: string;
  text: string;
  font: string;
  textColor: string;
  textSize: number;
  textPosition: { x: number; y: number };
  special_instructions: string;
  uploaded_images: File[];
  quantity: number;
  customFee: number;
}

const COLORS = [
  { name: "কালো", value: "black", hex: "#000000", gradient: "from-gray-800 to-black" },
  { name: "সাদা", value: "white", hex: "#FFFFFF", gradient: "from-gray-100 to-white" },
  { name: "লাল", value: "red", hex: "#EF4444", gradient: "from-red-400 to-red-600" },
  { name: "নীল", value: "blue", hex: "#3B82F6", gradient: "from-blue-400 to-blue-600" },
  { name: "সবুজ", value: "green", hex: "#10B981", gradient: "from-green-400 to-green-600" },
  { name: "হলুদ", value: "yellow", hex: "#F59E0B", gradient: "from-yellow-400 to-yellow-600" },
  { name: "গোলাপী", value: "pink", hex: "#EC4899", gradient: "from-pink-400 to-pink-600" },
  { name: "বেগুনী", value: "purple", hex: "#8B5CF6", gradient: "from-purple-400 to-purple-600" },
  { name: "কমলা", value: "orange", hex: "#F97316", gradient: "from-orange-400 to-orange-600" },
  { name: "নেভি", value: "navy", hex: "#1E40AF", gradient: "from-blue-800 to-blue-900" }
];

const SIZES = [
  { name: "ছোট (S)", value: "S", description: "বুক: ৩৬-৩৮ ইঞ্চি" },
  { name: "মাঝারি (M)", value: "M", description: "বুক: ৩৮-৪০ ইঞ্চি" },
  { name: "বড় (L)", value: "L", description: "বুক: ৪০-৪২ ইঞ্চি" },
  { name: "অতিরিক্ত বড় (XL)", value: "XL", description: "বুক: ৪২-৪৪ ইঞ্চি" },
  { name: "XXL", value: "XXL", description: "বুক: ৪৪-৪৬ ইঞ্চি" }
];

const FONTS = [
  { name: "সাধারণ", value: "system-ui", preview: "AaBbCc ১২৩" },
  { name: "বোল্ড", value: "bold", preview: "AaBbCc ১২৩" },
  { name: "ইটালিক", value: "italic", preview: "AaBbCc ১২ৃ" },
  { name: "হস্তাক্ষর", value: "handwriting", preview: "AaBbCc ১২৩" },
  { name: "আর্ট", value: "artistic", preview: "AaBbCc ১২৩" },
  { name: "মডার্ন", value: "modern", preview: "AaBbCc ১২৩" }
];

const TEXT_COLORS = [
  { name: "কালো", value: "#000000", hex: "#000000" },
  { name: "সাদা", value: "#FFFFFF", hex: "#FFFFFF" },
  { name: "সোনালী", value: "#FFD700", hex: "#FFD700" },
  { name: "রুপালী", value: "#C0C0C0", hex: "#C0C0C0" },
  { name: "লাল", value: "#FF0000", hex: "#FF0000" },
  { name: "নীল", value: "#0000FF", hex: "#0000FF" }
];

export default function UltraProfessionalCustomizeModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onDirectOrder
}: UltraProfessionalCustomizeModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [customization, setCustomization] = useState<CustomizationData>({
    color: "",
    colorName: "",
    size: "",
    text: "",
    font: "system-ui",
    textColor: "#000000",
    textSize: 18,
    textPosition: { x: 50, y: 50 },
    special_instructions: "",
    uploaded_images: [],
    quantity: 1,
    customFee: 100
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024;
      if (!isValid) {
        toast({
          title: "ফাইল সমস্যা",
          description: "শুধু ইমেজ ফাইল (৫MB এর কম) আপলোড করুন",
          variant: "destructive",
        });
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      setCustomization(prev => ({
        ...prev,
        uploaded_images: [...prev.uploaded_images, ...validFiles]
      }));

      // Create preview URLs
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newUrls]);

      toast({
        title: "ছবি আপলোড সফল!",
        description: `${validFiles.length}টি ছবি সফলভাবে আপলোড হয়েছে`,
      });
    }
  }, [toast]);

  const removeImage = useCallback((index: number) => {
    setCustomization(prev => ({
      ...prev,
      uploaded_images: prev.uploaded_images.filter((_, i) => i !== index)
    }));
    
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  }, [imageUrls]);

  const handleAddToCart = async () => {
    if (!customization.size) {
      toast({
        title: "সাইজ নির্বাচন করুন",
        description: "অনুগ্রহ করে একটি সাইজ নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const customizationData = {
        ...customization,
        custom_images: imageUrls,
        instructions: customization.special_instructions
      };

      await onAddToCart(product, customizationData);
      
      toast({
        title: "কাস্টম পণ্য যোগ করা হয়েছে!",
        description: `${product.name} আপনার পছন্দমতো কাস্টমাইজ করে কার্টে যোগ করা হয়েছে`,
      });

      onClose();
    } catch (error) {
      console.error('Error adding customized product:', error);
      toast({
        title: "ত্রুটি",
        description: "কাস্টম পণ্য যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectOrder = async () => {
    if (!customization.size) {
      toast({
        title: "সাইজ নির্বাচন করুন",
        description: "অনুগ্রহ করে একটি সাইজ নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    if (onDirectOrder) {
      setIsLoading(true);
      try {
        const customizationData = {
          ...customization,
          custom_images: imageUrls,
          instructions: customization.special_instructions
        };

        await onDirectOrder(product, customizationData);
        onClose();
      } catch (error) {
        console.error('Error creating direct order:', error);
        toast({
          title: "ত্রুটি",
          description: "সরাসরি অর্ডার করতে সমস্যা হয়েছে",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetCustomization = () => {
    setCustomization({
      color: "",
      colorName: "",
      size: "",
      text: "",
      font: "system-ui",
      textColor: "#000000",
      textSize: 18,
      textPosition: { x: 50, y: 50 },
      special_instructions: "",
      uploaded_images: [],
      quantity: 1,
      customFee: 100
    });
    setImageUrls([]);
    setActiveStep(1);
  };

  const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const totalPrice = (productPrice + customization.customFee) * customization.quantity;

  const steps = [
    { id: 1, title: "সাইজ ও রং", icon: Shirt },
    { id: 2, title: "টেক্সট ও ডিজাইন", icon: Type },
    { id: 3, title: "ছবি আপলোড", icon: Camera },
    { id: 4, title: "চূড়ান্ত করুন", icon: CheckCircle }
  ];

  return (
    <PerfectResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="7xl"
      className="p-0"
      showCloseButton={false}
      enableScroll={true}
    >
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 md:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold">{product.name} কাস্টমাইজ করুন</h2>
                <p className="text-blue-100 text-sm md:text-base">আপনার স্বপ্নের ডিজাইন তৈরি করুন</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? "সম্পাদনা" : "প্রিভিউ"}
              </Button>
              <Button
                onClick={resetCustomization}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-4 md:mt-6">
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = activeStep === step.id;
                const isCompleted = activeStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <motion.div
                      className={`flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-white text-blue-600 shadow-lg' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/20 text-white'
                      }`}
                      onClick={() => setActiveStep(step.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <StepIcon className="w-5 h-5" />
                      <span className="font-medium hidden sm:block">{step.title}</span>
                      {isCompleted && <CheckCircle className="w-4 h-4 ml-1" />}
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div className={`hidden sm:block w-12 h-0.5 mx-2 ${isCompleted ? 'bg-green-400' : 'bg-white/30'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 min-h-full">
            {/* Product Preview */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm h-fit">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    লাইভ প্রিভিউ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative bg-gray-100 rounded-lg p-3 aspect-square overflow-hidden max-w-xs mx-auto">
                    {/* Product Image */}
                    <img
                      src={product.image_url || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    
                    {/* Custom Text Overlay */}
                    {customization.text && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: `${customization.textPosition.x}%`,
                          top: `${customization.textPosition.y}%`,
                          transform: 'translate(-50%, -50%)',
                          color: customization.textColor,
                          fontSize: `${customization.textSize}px`,
                          fontFamily: customization.font,
                          fontWeight: customization.font === 'bold' ? 'bold' : 'normal',
                          fontStyle: customization.font === 'italic' ? 'italic' : 'normal',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                          zIndex: 10
                        }}
                      >
                        {customization.text}
                      </div>
                    )}
                    
                    {/* Uploaded Images */}
                    {imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Custom ${index + 1}`}
                        className="absolute top-2 right-2 w-16 h-16 object-cover rounded border-2 border-white shadow-lg"
                        style={{ top: `${10 + index * 70}px` }}
                      />
                    ))}
                  </div>

                  {/* Price Display */}
                  <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-xl">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">মোট মূল্য</div>
                      <div className="text-xl md:text-2xl font-bold text-green-600">
                        {formatPrice(totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {customization.quantity}টি × ({formatPrice(productPrice)} + {formatPrice(customization.customFee)} কাস্টমাইজেশন ফি)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customization Options */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: Size & Color */}
                  {activeStep === 1 && (
                    <div className="space-y-6">
                      <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <CardTitle className="flex items-center gap-2">
                            <Shirt className="w-5 h-5" />
                            সাইজ নির্বাচন করুন *
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {SIZES.map(size => (
                              <motion.button
                                key={size.value}
                                onClick={() => setCustomization(prev => ({ ...prev, size: size.value }))}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                  customization.size === size.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="font-medium">{size.name}</div>
                                <div className="text-sm text-gray-500">{size.description}</div>
                              </motion.button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                          <CardTitle className="flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            রং নির্বাচন করুন
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                            {COLORS.map(color => (
                              <motion.button
                                key={color.value}
                                onClick={() => setCustomization(prev => ({ 
                                  ...prev, 
                                  color: color.value, 
                                  colorName: color.name 
                                }))}
                                className={`relative w-12 h-12 rounded-full border-4 transition-all ${
                                  customization.color === color.value
                                    ? 'border-blue-500 shadow-lg'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: color.hex }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={color.name}
                              >
                                {customization.color === color.value && (
                                  <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-blue-500 bg-white rounded-full" />
                                )}
                              </motion.button>
                            ))}
                          </div>
                          {customization.colorName && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">নির্বাচিত রং: </span>
                              <span className="font-medium">{customization.colorName}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 2: Text & Design */}
                  {activeStep === 2 && (
                    <div className="space-y-6">
                      <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                          <CardTitle className="flex items-center gap-2">
                            <Type className="w-5 h-5" />
                            কাস্টম টেক্সট
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                          <div>
                            <Label htmlFor="customText">আপনার টেক্সট লিখুন</Label>
                            <Input
                              id="customText"
                              value={customization.text}
                              onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                              placeholder="যেমন: নাম, বার্তা, স্লোগান..."
                              className="mt-2"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label>ফন্ট নির্বাচন করুন</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {FONTS.map(font => (
                                  <button
                                    key={font.value}
                                    onClick={() => setCustomization(prev => ({ ...prev, font: font.value }))}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                                      customization.font === font.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="font-medium text-sm">{font.name}</div>
                                    <div className="text-xs text-gray-500" style={{ fontFamily: font.value }}>
                                      {font.preview}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label>টেক্সট রং</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {TEXT_COLORS.map(color => (
                                  <button
                                    key={color.value}
                                    onClick={() => setCustomization(prev => ({ ...prev, textColor: color.value }))}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                                      customization.textColor === color.value
                                        ? 'border-blue-500 shadow-lg'
                                        : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label>টেক্সট সাইজ: {customization.textSize}px</Label>
                            <Slider
                              value={[customization.textSize]}
                              onValueChange={(value) => setCustomization(prev => ({ ...prev, textSize: value[0] }))}
                              max={40}
                              min={12}
                              step={2}
                              className="mt-2"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 3: Image Upload */}
                  {activeStep === 3 && (
                    <div className="space-y-6">
                      <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                          <CardTitle className="flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            ছবি আপলোড করুন
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-700 mb-2">ছবি আপলোড করুন</p>
                            <p className="text-gray-500">ক্লিক করুন বা ছবি টেনে আনুন</p>
                            <p className="text-sm text-gray-400 mt-2">সাপোর্ট: JPG, PNG, WebP (সর্বোচ্চ ৫MB)</p>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />

                          {imageUrls.length > 0 && (
                            <div className="mt-6">
                              <Label className="text-sm font-medium">আপলোডকৃত ছবি ({imageUrls.length})</Label>
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-3">
                                {imageUrls.map((url, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={url}
                                      alt={`Upload ${index + 1}`}
                                      className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                      onClick={() => removeImage(index)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 4: Final */}
                  {activeStep === 4 && (
                    <div className="space-y-6">
                      <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                          <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            বিশেষ নির্দেশনা
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <Textarea
                            value={customization.special_instructions}
                            onChange={(e) => setCustomization(prev => ({ ...prev, special_instructions: e.target.value }))}
                            placeholder="আপনার পছন্দের কোনো বিশেষ নির্দেশনা লিখুন..."
                            className="min-h-[100px]"
                          />
                        </CardContent>
                      </Card>

                      <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            পরিমাণ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Button
                              onClick={() => setCustomization(prev => ({ 
                                ...prev, 
                                quantity: Math.max(1, prev.quantity - 1) 
                              }))}
                              variant="outline"
                              size="sm"
                              disabled={customization.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-xl font-semibold w-12 text-center">
                              {customization.quantity}
                            </span>
                            <Button
                              onClick={() => setCustomization(prev => ({ 
                                ...prev, 
                                quantity: prev.quantity + 1 
                              }))}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 md:mt-8 pt-4 md:pt-6 border-t gap-4 sm:gap-0">
                <Button
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                  variant="outline"
                  disabled={activeStep === 1}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  পূর্ববর্তী
                </Button>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {activeStep < 4 ? (
                    <Button
                      onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 flex items-center gap-2 w-full sm:w-auto"
                    >
                      পরবর্তী
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleAddToCart}
                        disabled={isLoading || !customization.size}
                        variant="outline"
                        className="flex items-center gap-2 w-full sm:w-auto"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        কার্টে যোগ করুন
                      </Button>
                      {onDirectOrder && (
                        <Button
                          onClick={handleDirectOrder}
                          disabled={isLoading || !customization.size}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center gap-2 w-full sm:w-auto"
                        >
                          <Zap className="w-4 h-4" />
                          সরাসরি অর্ডার
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PerfectResponsiveModal>
  );
}