import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  CheckCircle,
  MessageCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface EnhancedCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, customization: any) => Promise<void>;
  onDirectOrder?: (product: Product, customization: any) => Promise<void>;
}

interface CustomizationData {
  color: string;
  size: string;
  text: string;
  font: string;
  special_instructions: string;
  uploaded_images: string[]; // Base64 strings
  quantity: number;
}

export default function EnhancedCustomizeModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onDirectOrder
}: EnhancedCustomizeModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [customization, setCustomization] = useState<CustomizationData>({
    color: "",
    size: "",
    text: "",
    font: "default",
    special_instructions: "",
    uploaded_images: [],
    quantity: 1
  });

  if (!product) return null;

  const colors = [
    { name: "কালো", value: "black", hex: "#000000" },
    { name: "সাদা", value: "white", hex: "#FFFFFF" },
    { name: "লাল", value: "red", hex: "#EF4444" },
    { name: "নীল", value: "blue", hex: "#3B82F6" },
    { name: "সবুজ", value: "green", hex: "#10B981" },
    { name: "হলুদ", value: "yellow", hex: "#F59E0B" },
    { name: "গোলাপী", value: "pink", hex: "#EC4899" },
    { name: "বেগুনী", value: "purple", hex: "#8B5CF6" }
  ];

  const sizes = [
    { name: "ছোট (S)", value: "S" },
    { name: "মাঝারি (M)", value: "M" },
    { name: "বড় (L)", value: "L" },
    { name: "অতিরিক্ত বড় (XL)", value: "XL" },
    { name: "XXL", value: "XXL" }
  ];

  const fonts = [
    { name: "সাধারণ", value: "default" },
    { name: "বোল্ড", value: "bold" },
    { name: "ইটালিক", value: "italic" },
    { name: "হস্তাক্ষর", value: "handwriting" },
    { name: "আর্ট", value: "artistic" }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const promises = validFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(base64Images => {
        setCustomization(prev => ({
          ...prev,
          uploaded_images: [...prev.uploaded_images, ...base64Images].slice(0, 5)
        }));
      });
    }
  };

  const removeImage = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      uploaded_images: prev.uploaded_images.filter((_, i) => i !== index)
    }));
  };

  const updateQuantity = (change: number) => {
    setCustomization(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + change)
    }));
  };

  const handleDirectOrder = async () => {
    if (!customization.color && !customization.size && !customization.text && customization.uploaded_images.length === 0) {
      toast({
        title: "কাস্টমাইজেশন প্রয়োজন",
        description: "অন্তত একটি কাস্টমাইজেশন অপশন নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const customOrderData = {
        productId: product.id,
        productName: product.name,
        productPrice: productPrice,
        productImage: product.image_url,
        quantity: customization.quantity,
        totalAmount: totalPrice,
        advancePayment: 100,
        customization: {
          color: customization.color,
          size: customization.size, 
          text: customization.text,
          font: customization.font,
          instructions: customization.special_instructions,
          uploaded_images: customization.uploaded_images,
          color_name: customization.color ? colors.find(c => c.value === customization.color)?.name : '',
          timestamp: new Date().toISOString()
        }
      };

      if (onDirectOrder) {
        await onDirectOrder(product, customOrderData);
      }
      onClose();
    } catch (error) {
      console.error('Error preparing custom order:', error);
      toast({
        title: "ত্রুটি", 
        description: "কাস্টম অর্ডার প্রস্তুত করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!customization.color && !customization.size && !customization.text && customization.uploaded_images.length === 0) {
      toast({
        title: "কাস্টমাইজেশন প্রয়োজন",
        description: "অন্তত একটি কাস্টমাইজেশন অপশন নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const customizationData = {
        ...customization,
        color_name: customization.color ? colors.find(c => c.value === customization.color)?.name : '',
        font_name: customization.font ? fonts.find(f => f.value === customization.font)?.name : '',
        timestamp: new Date().toISOString()
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

  const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const totalPrice = productPrice * customization.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] max-h-[900px] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            কাস্টমাইজ করুন: {product.name}
          </DialogTitle>
          <DialogDescription>
            আপনার পছন্দমতো ডিজাইন করুন এবং অর্ডার করুন
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Product Preview - 2 columns */}
            <div className="lg:col-span-2">
              <Card className="h-fit sticky top-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    পণ্য প্রিভিউ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-green-600">৳{productPrice}</span>
                        {customization.quantity > 1 && (
                          <span className="text-sm text-gray-500">× {customization.quantity}</span>
                        )}
                      </div>
                      {customization.quantity > 1 && (
                        <div className="text-lg font-semibold text-blue-600">
                          মোট: ৳{totalPrice}
                        </div>
                      )}
                    </div>

                    {/* Customization Preview */}
                    {(customization.color || customization.size || customization.text) && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <h4 className="font-medium text-gray-900">আপনার কাস্টমাইজেশন:</h4>
                        {customization.color && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: colors.find(c => c.value === customization.color)?.hex }}
                            />
                            <span className="text-sm">{colors.find(c => c.value === customization.color)?.name}</span>
                          </div>
                        )}
                        {customization.size && (
                          <div className="text-sm">সাইজ: {customization.size}</div>
                        )}
                        {customization.text && (
                          <div className="text-sm">টেক্সট: "{customization.text}"</div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customization Options - 3 columns */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Color Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="w-5 h-5 text-purple-600" />
                    রং নির্বাচন করুন
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                        className={`relative w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                          customization.color === color.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {customization.color === color.value && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-blue-600 bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                  {customization.color && (
                    <Badge variant="outline" className="mt-2 bg-purple-50 text-purple-700 border-purple-200">
                      নির্বাচিত: {colors.find(c => c.value === customization.color)?.name}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Size Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shirt className="w-5 h-5 text-green-600" />
                    সাইজ নির্বাচন করুন
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {sizes.map((size) => (
                      <Button
                        key={size.value}
                        variant={customization.size === size.value ? "default" : "outline"}
                        onClick={() => setCustomization(prev => ({ ...prev, size: size.value }))}
                        className="h-10 text-sm"
                      >
                        {size.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Text Customization */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Type className="w-5 h-5 text-blue-600" />
                    টেক্সট যোগ করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="custom_text">আপনার টেক্সট লিখুন</Label>
                    <Input
                      id="custom_text"
                      value={customization.text}
                      onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="যেমন: নাম, বার্তা ইত্যাদি..."
                      maxLength={50}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {customization.text.length}/50 অক্ষর
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="font_style">ফন্ট স্টাইল</Label>
                    <Select value={customization.font} onValueChange={(value) => setCustomization(prev => ({ ...prev, font: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="ফন্ট নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ImageIcon className="w-5 h-5 text-orange-600" />
                    ছবি আপলোড করুন (ঐচ্ছিক)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">ছবি আপলোড করতে ক্লিক করুন</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      ছবি যোগ করুন
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">সর্বোচ্চ ৫টি ছবি, প্রতিটি ৫MB এর কম</p>
                  </div>

                  {/* Image Previews */}
                  {customization.uploaded_images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {customization.uploaded_images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-16 object-cover rounded border border-gray-200"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Special Instructions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">বিশেষ নির্দেশনা (ঐচ্ছিক)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={customization.special_instructions}
                    onChange={(e) => setCustomization(prev => ({ ...prev, special_instructions: e.target.value }))}
                    placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন..."
                    maxLength={500}
                    rows={3}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {customization.special_instructions.length}/500 অক্ষর
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t pt-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label className="text-sm">পরিমাণ:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(-1)}
                  disabled={customization.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium text-sm">{customization.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">৳{totalPrice}</div>
                <div className="text-xs text-green-600">অ্যাডভান্স: ১০০৳ • বাকি: {totalPrice - 100}৳</div>
              </div>
              
              <Button
                onClick={handleDirectOrder}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    অর্ডার করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    সরাসরি অর্ডার (১০০৳ অ্যাডভান্স)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}