import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  X,
  Palette, 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Shirt, 
  Package,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Zap,
  Star,
  ShoppingCart,
  Eye,
  Trash2
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

interface PerfectResponsiveCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: any, customization: any) => Promise<void>;
}

interface CustomizationData {
  color: string;
  size: string;
  text: string;
  font: string;
  special_instructions: string;
  uploaded_images: File[];
  quantity: number;
}

export default function PerfectResponsiveCustomizeModal({
  isOpen,
  onClose,
  product,
  onAddToCart
}: PerfectResponsiveCustomizeModalProps) {
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

  const [imageUrls, setImageUrls] = useState<string[]>([]);

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

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const totalPrice = price * customization.quantity;

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024; // 5MB limit
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
        title: "ফাইল আপলোড সফল",
        description: `${validFiles.length} টি ইমেজ যোগ করা হয়েছে`,
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

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity < 1) return;
    setCustomization(prev => ({ ...prev, quantity: newQuantity }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!customization.color && !customization.size && !customization.text && customization.uploaded_images.length === 0) {
      toast({
        title: "কাস্টমাইজেশন প্রয়োজন",
        description: "অন্তত একটি কাস্টমাইজেশন অপশন বেছে নিন",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await onAddToCart(product, customization);
      
      toast({
        title: "অর্ডার সফল!",
        description: `কাস্টমাইজড ${product.name} কার্টে যোগ করা হয়েছে`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [customization, onAddToCart, product, onClose, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-[95vw] max-h-[95vh] p-0 gap-0 bg-white rounded-2xl overflow-hidden"
        data-testid="customize-modal"
      >
        <DialogTitle className="sr-only">{product.name} কাস্টমাইজ করুন</DialogTitle>
        <DialogDescription className="sr-only">
          {product.name} এর জন্য রং, সাইজ, টেক্সট এবং ইমেজ কাস্টমাইজেশন অপশন
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-orange-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">কাস্টমাইজ করুন</h2>
              <p className="text-gray-600 text-sm">{product.name}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-10 h-10 p-0 rounded-full hover:bg-gray-100"
            data-testid="button-close-customize-modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(95vh-100px)]">
          {/* Left Side - Product Preview */}
          <div className="lg:w-2/5 p-6 bg-gray-50 border-r">
            <div className="space-y-4 h-full flex flex-col">
              {/* Product Image */}
              <div className="flex-1">
                <Card className="overflow-hidden h-full">
                  <div className="aspect-square bg-white rounded-lg overflow-hidden relative">
                    <img
                      src={product.image_url || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Preview overlay for customizations */}
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">প্রিভিউ</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Price Info */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(totalPrice)}
                      </div>
                      {customization.quantity > 1 && (
                        <div className="text-sm text-gray-600">
                          {formatPrice(price)} × {customization.quantity}
                        </div>
                      )}
                    </div>
                    <Badge className="bg-orange-500">
                      কাস্টম অর্ডার
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Customization Options */}
          <div className="lg:w-3/5 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-8">
                {/* Color Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">রং বেছে নিন</h3>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                        className={`group relative w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                          customization.color === color.value 
                            ? 'border-primary shadow-lg scale-110' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        data-testid={`color-${color.value}`}
                      >
                        <div 
                          className="w-full h-full rounded-lg"
                          style={{ backgroundColor: color.hex }}
                        />
                        {customization.color === color.value && (
                          <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-primary bg-white rounded-full" />
                        )}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {color.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Size Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <Shirt className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">সাইজ</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setCustomization(prev => ({ ...prev, size: size.value }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                          customization.size === size.value 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        data-testid={`size-${size.value}`}
                      >
                        <div className="font-semibold">{size.value}</div>
                        <div className="text-xs text-gray-600">{size.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Text Customization */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Type className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">টেক্সট যোগ করুন</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-text" className="text-sm font-medium">
                        আপনার টেক্সট লিখুন
                      </Label>
                      <Input
                        id="custom-text"
                        value={customization.text}
                        onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="উদাহরণ: My Custom Text"
                        className="mt-1"
                        data-testid="input-custom-text"
                      />
                    </div>

                    <div>
                      <Label htmlFor="font-select" className="text-sm font-medium">
                        ফন্ট স্টাইল
                      </Label>
                      <Select 
                        value={customization.font} 
                        onValueChange={(value) => setCustomization(prev => ({ ...prev, font: value }))}
                      >
                        <SelectTrigger className="mt-1" data-testid="select-font">
                          <SelectValue placeholder="ফন্ট বেছে নিন" />
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
                  </div>
                </div>

                <Separator />

                {/* Image Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">ছবি আপলোড</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5"
                      data-testid="button-upload-image"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm">ছবি আপলোড করুন</div>
                        <div className="text-xs text-gray-500">PNG, JPG (সর্বোচ্চ ৫MB)</div>
                      </div>
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Uploaded Images Preview */}
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Upload ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-8 h-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Special Instructions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">বিশেষ নির্দেশনা</h3>
                  </div>
                  
                  <Textarea
                    value={customization.special_instructions}
                    onChange={(e) => setCustomization(prev => ({ ...prev, special_instructions: e.target.value }))}
                    placeholder="কোন বিশেষ নির্দেশনা থাকলে এখানে লিখুন..."
                    rows={3}
                    className="resize-none"
                    data-testid="textarea-special-instructions"
                  />
                </div>

                <Separator />

                {/* Quantity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">পরিমাণ</h3>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(customization.quantity - 1)}
                      disabled={customization.quantity <= 1}
                      className="w-12 h-12 p-0 rounded-full"
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold">{customization.quantity}</div>
                      <div className="text-sm text-gray-500">পিস</div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(customization.quantity + 1)}
                      className="w-12 h-12 p-0 rounded-full"
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t p-6 bg-gray-50">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  বাতিল
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                  data-testid="button-add-to-cart-customized"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      যোগ করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      কার্টে যোগ করুন ({formatPrice(totalPrice)})
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4 mr-1" />
                কাস্টম অর্ডার ৩-৫ কার্যদিবসে প্রস্তুত হবে
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}