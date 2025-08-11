import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
  ShoppingCart,
  Trash2,
  Star
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
    { name: "ছোট", value: "S" },
    { name: "মাঝারি", value: "M" },
    { name: "বড়", value: "L" },
    { name: "অতিরিক্ত বড়", value: "XL" },
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
        className="max-w-6xl w-[95vw] h-[90vh] p-0 gap-0 bg-white rounded-xl overflow-hidden"
        data-testid="customize-modal"
      >
        <DialogTitle className="sr-only">{product.name} কাস্টমাইজ করুন</DialogTitle>
        <DialogDescription className="sr-only">
          {product.name} এর জন্য রং, সাইজ, টেক্সট এবং ইমেজ কাস্টমাইজেশন অপশন
        </DialogDescription>

        {/* Modal Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">কাস্টমাইজ করুন</h2>
              <p className="text-gray-600 text-sm truncate max-w-48">{product.name}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
            data-testid="button-close-customize-modal"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modal Body - Flex Container */}
        <div className="flex flex-1 min-h-0">
          
          {/* Product Preview - Left Side - Fixed Width */}
          <div className="w-80 flex-shrink-0 p-4 bg-gray-50 border-r">
            <div className="h-full flex flex-col">
              <div className="flex-1 mb-4">
                <div className="aspect-square bg-white rounded-lg overflow-hidden border">
                  <img
                    src={product.image_url || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Price Display */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary mb-1">
                      {formatPrice(totalPrice)}
                    </div>
                    {customization.quantity > 1 && (
                      <div className="text-xs text-gray-600">
                        {formatPrice(price)} × {customization.quantity}
                      </div>
                    )}
                    <Badge className="bg-orange-500 text-xs mt-2">
                      কাস্টম অর্ডার
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Customization Options - Right Side - Flexible */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6">
                
                {/* Color Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-gray-900">রং বেছে নিন</h3>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                        className={`relative w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                          customization.color === color.value 
                            ? 'border-primary shadow-md scale-110' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        data-testid={`color-${color.value}`}
                        title={color.name}
                      >
                        <div 
                          className="w-full h-full rounded-md"
                          style={{ backgroundColor: color.hex }}
                        />
                        {customization.color === color.value && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-primary bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Size Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-gray-900">সাইজ</h3>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setCustomization(prev => ({ ...prev, size: size.value }))}
                        className={`p-2 rounded-lg border-2 text-center transition-all duration-200 ${
                          customization.size === size.value 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        data-testid={`size-${size.value}`}
                      >
                        <div className="font-bold text-sm">{size.value}</div>
                        <div className="text-xs text-gray-600">{size.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Text Customization */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-gray-900">টেক্সট যোগ করুন</h3>
                  </div>
                  <div className="space-y-3">
                    <Input
                      value={customization.text}
                      onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="উদাহরণ: My Custom Text"
                      className="text-sm"
                      data-testid="input-custom-text"
                    />
                    <Select 
                      value={customization.font} 
                      onValueChange={(value) => setCustomization(prev => ({ ...prev, font: value }))}
                    >
                      <SelectTrigger className="text-sm" data-testid="select-font">
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

                <Separator />

                {/* Image Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-gray-900">ছবি আপলোড</h3>
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5"
                      data-testid="button-upload-image"
                    >
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
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

                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
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
                              className="absolute -top-1 -right-1 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Special Instructions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-gray-900">বিশেষ নির্দেশনা</h3>
                  </div>
                  <Textarea
                    value={customization.special_instructions}
                    onChange={(e) => setCustomization(prev => ({ ...prev, special_instructions: e.target.value }))}
                    placeholder="কোন বিশেষ নির্দেশনা থাকলে এখানে লিখুন..."
                    rows={2}
                    className="resize-none text-sm"
                    data-testid="textarea-special-instructions"
                  />
                </div>

                <Separator />

                {/* Quantity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-gray-900">পরিমাণ</h3>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(customization.quantity - 1)}
                      disabled={customization.quantity <= 1}
                      className="w-10 h-10 p-0 rounded-full"
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <div className="text-center min-w-[60px]">
                      <div className="text-xl font-bold">{customization.quantity}</div>
                      <div className="text-xs text-gray-500">পিস</div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(customization.quantity + 1)}
                      className="w-10 h-10 p-0 rounded-full"
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions - Fixed */}
            <div className="flex-shrink-0 border-t p-4 bg-gray-50">
              <div className="flex gap-3">
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
              
              <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
                <AlertCircle className="w-3 h-3 mr-1" />
                কাস্টম অর্ডার ৩-৫ কার্যদিবসে প্রস্তুত হবে
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}