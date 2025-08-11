import { useState, useRef } from "react";
import PerfectModalBase from "./perfect-modal-base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  AlertCircle,
  CheckCircle,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface PerfectCustomizeModalProps {
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

export default function PerfectCustomizeModal({
  isOpen,
  onClose,
  product,
  onAddToCart
}: PerfectCustomizeModalProps) {
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        uploaded_images: [...prev.uploaded_images, ...validFiles].slice(0, 5) // Max 5 images
      }));

      // Create preview URLs
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newUrls].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      uploaded_images: prev.uploaded_images.filter((_, i) => i !== index)
    }));
    
    // Revoke URL and update preview URLs
    if (imageUrls[index]) {
      URL.revokeObjectURL(imageUrls[index]);
    }
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (change: number) => {
    setCustomization(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + change)
    }));
  };

  const createWhatsAppUrl = () => {
    const phoneNumber = "8801765555593";
    const message = `আসসালামু আলাইকুম! আমি ${product.name} কাস্টমাইজ করতে চাই।

কাস্টমাইজেশন তথ্য:
${customization.color ? `রং: ${colors.find(c => c.value === customization.color)?.name}` : ''}
${customization.size ? `সাইজ: ${customization.size}` : ''}
${customization.text ? `টেক্সট: ${customization.text}` : ''}
${customization.font ? `ফন্ট: ${fonts.find(f => f.value === customization.font)?.name}` : ''}
${customization.special_instructions ? `বিশেষ নির্দেশনা: ${customization.special_instructions}` : ''}
পরিমাণ: ${customization.quantity}

দয়া করে আমাকে সাহায্য করুন।`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleAddToCart = async () => {
    if (!customization.color && !customization.text && customization.uploaded_images.length === 0) {
      toast({
        title: "কাস্টমাইজেশন প্রয়োজন",
        description: "অন্তত একটি কাস্টমাইজেশন অপশন নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Convert files to base64 for storage
      const imagePromises = customization.uploaded_images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(imagePromises);

      const customizationData = {
        ...customization,
        uploaded_images: base64Images,
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
    <PerfectModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`কাস্টমাইজ করুন: ${product.name}`}
      description="আপনার পছন্দমতো ডিজাইন করুন"
      maxWidth="5xl"
      data-testid="modal-customize-product"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Preview */}
        <div className="lg:col-span-1">
          <Card>
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
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                )}
                
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-green-600">৳{typeof product.price === 'string' ? parseFloat(product.price) : product.price}</span>
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

        {/* Customization Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Color Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                রং নির্বাচন করুন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                    className={`relative w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                      customization.color === color.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    data-testid={`button-color-${color.value}`}
                  >
                    {customization.color === color.value && (
                      <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-blue-600 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              {customization.color && (
                <div className="mt-3">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    নির্বাচিত: {colors.find(c => c.value === customization.color)?.name}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Size Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-green-600" />
                সাইজ নির্বাচন করুন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {sizes.map((size) => (
                  <Button
                    key={size.value}
                    variant={customization.size === size.value ? "default" : "outline"}
                    onClick={() => setCustomization(prev => ({ ...prev, size: size.value }))}
                    className="h-12"
                    data-testid={`button-size-${size.value}`}
                  >
                    {size.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Text Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-600" />
                টেক্সট যোগ করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom_text">আপনার টেক্সট লিখুন</Label>
                <Input
                  id="custom_text"
                  value={customization.text}
                  onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="যেমন: নাম, বার্তা ইত্যাদি..."
                  maxLength={50}
                  data-testid="input-custom-text"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {customization.text.length}/50 অক্ষর
                </div>
              </div>

              <div>
                <Label htmlFor="font_style">ফন্ট স্টাইল</Label>
                <Select value={customization.font} onValueChange={(value) => setCustomization(prev => ({ ...prev, font: value }))}>
                  <SelectTrigger data-testid="select-font-style">
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-orange-600" />
                ছবি আপলোড করুন (ঐচ্ছিক)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">ছবি আপলোড করতে ক্লিক করুন</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-images"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  ছবি যোগ করুন
                </Button>
                <p className="text-xs text-gray-500 mt-2">সর্বোচ্চ ৫টি ছবি, প্রতিটি ৫MB এর কম</p>
              </div>

              {/* Image Previews */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-remove-image-${index}`}
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
            <CardHeader>
              <CardTitle>বিশেষ নির্দেশনা (ঐচ্ছিক)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customization.special_instructions}
                onChange={(e) => setCustomization(prev => ({ ...prev, special_instructions: e.target.value }))}
                placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন..."
                maxLength={500}
                rows={4}
                data-testid="textarea-special-instructions"
              />
              <div className="text-xs text-gray-500 mt-1">
                {customization.special_instructions.length}/500 অক্ষর
              </div>
            </CardContent>
          </Card>

          {/* Quantity and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Label>পরিমাণ:</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(-1)}
                      disabled={customization.quantity <= 1}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{customization.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(1)}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">৳{totalPrice}</div>
                  <div className="text-sm text-gray-500">মোট দাম</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                  data-testid="button-add-custom-to-cart"
                >
                  <Package className="w-5 h-5 mr-2" />
                  {isLoading ? "যোগ করা হচ্ছে..." : `কার্টে যোগ করুন (৳${totalPrice})`}
                </Button>

                <Button
                  onClick={() => window.open(createWhatsAppUrl(), '_blank')}
                  variant="outline"
                  className="flex-1 border-green-300 text-green-700 hover:bg-green-50 py-3"
                  data-testid="button-whatsapp-custom-order"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  হোয়াটসঅ্যাপে অর্ডার
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PerfectModalBase>
  );
}