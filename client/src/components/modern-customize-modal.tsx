import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, Palette, Type, ImageIcon, Package, Sparkles, Upload, 
  Plus, Minus, ShoppingCart, Heart, Share2, CheckCircle,
  Shirt, Ruler, PaintBucket, FileText, Gift, Truck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface CustomizationOptions {
  size: string;
  color: string;
  material: string;
  text: string;
  font: string;
  textColor: string;
  quantity: number;
  images: string[];
  engraving: string;
  giftWrap: boolean;
  expressDelivery: boolean;
  specialInstructions: string;
}

interface ModernCustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, customization: CustomizationOptions) => void;
}

const sizeOptions = [
  { value: 'xs', label: 'অতি ছোট (XS)', price: 0 },
  { value: 's', label: 'ছোট (S)', price: 0 },
  { value: 'm', label: 'মাঝারি (M)', price: 50 },
  { value: 'l', label: 'বড় (L)', price: 100 },
  { value: 'xl', label: 'অতি বড় (XL)', price: 150 },
  { value: 'xxl', label: 'দ্বিগুণ বড় (XXL)', price: 200 }
];

const colorOptions = [
  { name: 'কালো', value: '#000000' },
  { name: 'সাদা', value: '#FFFFFF' },
  { name: 'লাল', value: '#EF4444' },
  { name: 'নীল', value: '#3B82F6' },
  { name: 'সবুজ', value: '#10B981' },
  { name: 'গোলাপি', value: '#EC4899' },
  { name: 'হলুদ', value: '#F59E0B' },
  { name: 'বেগুনি', value: '#8B5CF6' },
  { name: 'কমলা', value: '#F97316' },
  { name: 'ধূসর', value: '#6B7280' }
];

const materialOptions = [
  { value: 'cotton', label: 'তুলা', price: 0 },
  { value: 'silk', label: 'রেশম', price: 300 },
  { value: 'polyester', label: 'পলিয়েস্টার', price: 100 },
  { value: 'wool', label: 'পশম', price: 500 },
  { value: 'linen', label: 'লিনেন', price: 200 },
  { value: 'premium', label: 'প্রিমিয়াম', price: 800 }
];

const fontOptions = [
  { value: 'bangla-default', label: 'বাংলা সাধারণ' },
  { value: 'bangla-bold', label: 'বাংলা মোটা' },
  { value: 'english-serif', label: 'ইংরেজি সেরিফ' },
  { value: 'english-sans', label: 'ইংরেজি স্যান্স' },
  { value: 'decorative', label: 'সাজসজ্জা' },
  { value: 'calligraphy', label: 'হস্তাক্ষর' }
];

export default function ModernCustomizeModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ModernCustomizeModalProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customization, setCustomization] = useState<CustomizationOptions>({
    size: 'm',
    color: '#000000',
    material: 'cotton',
    text: '',
    font: 'bangla-default',
    textColor: '#000000',
    quantity: 1,
    images: [],
    engraving: '',
    giftWrap: false,
    expressDelivery: false,
    specialInstructions: ''
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [previewMode, setPreviewMode] = useState('2d');
  const [isUploading, setIsUploading] = useState(false);

  if (!product) return null;

  const basePrice = Number(product.price) || 0;

  const calculateTotalPrice = useCallback(() => {
    let total = basePrice;

    // Size pricing
    const sizeOption = sizeOptions.find(s => s.value === customization.size);
    if (sizeOption) total += sizeOption.price;

    // Material pricing
    const materialOption = materialOptions.find(m => m.value === customization.material);
    if (materialOption) total += materialOption.price;

    // Text customization
    if (customization.text.trim()) total += 100;

    // Engraving
    if (customization.engraving.trim()) total += 200;

    // Image upload
    if (customization.images.length > 0) total += customization.images.length * 150;

    // Gift wrap
    if (customization.giftWrap) total += 80;

    // Express delivery
    if (customization.expressDelivery) total += 120;

    return total * customization.quantity;
  }, [customization, basePrice]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    // Simulate upload (in real app, upload to cloud storage)
    setTimeout(() => {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setCustomization(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 3) // Max 3 images
      }));
      setIsUploading(false);

      toast({
        title: "ছবি আপলোড সফল",
        description: `${files.length}টি ছবি সফলভাবে যোগ করা হয়েছে`,
      });
    }, 1500);
  };

  const removeImage = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddToCart = () => {
    // Store custom order data in localStorage for checkout
    const customOrderData = {
      productId: product.id,
      productName: product.name,
      productPrice: basePrice,
      quantity: customization.quantity,
      totalAmount: totalPrice,
      customization: {
        size: customization.size,
        color: customization.color,
        material: customization.material,
        text: customization.text,
        font: customization.font,
        textColor: customization.textColor,
        engraving: customization.engraving,
        giftWrap: customization.giftWrap,
        expressDelivery: customization.expressDelivery,
        specialInstructions: customization.specialInstructions,
        images: customization.images,
        timestamp: new Date().toISOString()
      }
    };

    localStorage.setItem('pendingCustomOrder', JSON.stringify(customOrderData));

    // Redirect to checkout with custom order flag
    window.location.href = '/checkout?customOrder=true&total=' + totalPrice;

    toast({
      title: "চেকআউটে পুনর্নিদেশিত হচ্ছে!",
      description: `আপনার কাস্টম অর্ডার প্রস্তুত, এখন চেকআউট সম্পূর্ণ করুন`,
      duration: 3000,
    });

    onClose();
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] w-[calc(100vw-16px)] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Palette className="w-6 h-6 text-orange-500" />
                  {product.name} কাস্টমাইজ করুন
                </DialogTitle>
                <DialogDescription className="mt-1 text-gray-600">
                  আপনার পছন্দ অনুযায়ী পণ্যটি সাজিয়ে নিন
                </DialogDescription>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  মোট: {formatPrice(totalPrice)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Preview Section */}
              <div className="space-y-6">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative">
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Color overlay */}
                      <div 
                        className="absolute inset-0 mix-blend-multiply opacity-20"
                        style={{ backgroundColor: customization.color }}
                      />

                      {/* Text overlay */}
                      {customization.text && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ color: customization.textColor }}
                        >
                          <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
                            <span className="text-xl font-bold">
                              {customization.text}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Info */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg">কাস্টমাইজেশন সারাংশ</h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">সাইজ:</span>
                        <span className="ml-2 font-medium">
                          {sizeOptions.find(s => s.value === customization.size)?.label}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-600">উপাদান:</span>
                        <span className="ml-2 font-medium">
                          {materialOptions.find(m => m.value === customization.material)?.label}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-600">পরিমাণ:</span>
                        <span className="ml-2 font-medium">{customization.quantity}টি</span>
                      </div>

                      <div>
                        <span className="text-gray-600">ছবি:</span>
                        <span className="ml-2 font-medium">{customization.images.length}টি</span>
                      </div>
                    </div>

                    {customization.giftWrap && (
                      <Badge className="bg-pink-500 text-white">
                        <Gift className="w-3 h-3 mr-1" />
                        গিফট র‍্যাপিং
                      </Badge>
                    )}

                    {customization.expressDelivery && (
                      <Badge className="bg-blue-500 text-white">
                        <Truck className="w-3 h-3 mr-1" />
                        দ্রুত ডেলিভারি
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Customization Options */}
              <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic" className="flex items-center gap-1">
                      <Shirt className="w-4 h-4" />
                      বেসিক
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center gap-1">
                      <Type className="w-4 h-4" />
                      টেক্সট
                    </TabsTrigger>
                    <TabsTrigger value="images" className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      ছবি
                    </TabsTrigger>
                    <TabsTrigger value="extras" className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      অতিরিক্ত
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Customizations */}
                  <TabsContent value="basic" className="space-y-6">
                    {/* Size Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Ruler className="w-4 h-4" />
                        সাইজ নির্বাচন করুন
                      </Label>
                      <Select value={customization.size} onValueChange={(value) => 
                        setCustomization(prev => ({ ...prev, size: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label} {size.price > 0 && `(+${formatPrice(size.price)})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <PaintBucket className="w-4 h-4" />
                        রং নির্বাচন করুন
                      </Label>
                      <div className="grid grid-cols-5 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                            className={`aspect-square rounded-lg border-2 transition-all ${
                              customization.color === color.value
                                ? 'border-orange-500 ring-2 ring-orange-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {customization.color === color.value && (
                              <CheckCircle className="w-4 h-4 text-white drop-shadow-lg" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Material Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">উপাদান নির্বাচন করুন</Label>
                      <Select value={customization.material} onValueChange={(value) => 
                        setCustomization(prev => ({ ...prev, material: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map((material) => (
                            <SelectItem key={material.value} value={material.value}>
                              {material.label} {material.price > 0 && `(+${formatPrice(material.price)})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">পরিমাণ</Label>
                      <div className="flex items-center gap-3">
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

                        <span className="font-semibold text-lg min-w-[2ch] text-center">
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
                    </div>
                  </TabsContent>

                  {/* Text Customization */}
                  <TabsContent value="text" className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">কাস্টম টেক্সট (+১০০ টাকা)</Label>
                      <Input
                        placeholder="আপনার পছন্দের টেক্সট লিখুন..."
                        value={customization.text}
                        onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                        className="text-lg"
                        maxLength={50}
                      />
                      <div className="text-sm text-gray-500">
                        {customization.text.length}/50 অক্ষর
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">ফন্ট নির্বাচন করুন</Label>
                      <Select value={customization.font} onValueChange={(value) => 
                        setCustomization(prev => ({ ...prev, font: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">টেক্সটের রং</Label>
                      <div className="grid grid-cols-5 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setCustomization(prev => ({ ...prev, textColor: color.value }))}
                            className={`aspect-square rounded-lg border-2 transition-all ${
                              customization.textColor === color.value
                                ? 'border-orange-500 ring-2 ring-orange-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {customization.textColor === color.value && (
                              <CheckCircle className="w-4 h-4 text-white drop-shadow-lg" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">খোদাই (+২০০ টাকা)</Label>
                      <Input
                        placeholder="খোদাই করার জন্য টেক্সট..."
                        value={customization.engraving}
                        onChange={(e) => setCustomization(prev => ({ ...prev, engraving: e.target.value }))}
                        maxLength={30}
                      />
                    </div>
                  </TabsContent>

                  {/* Image Upload */}
                  <TabsContent value="images" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          কাস্টম ছবি আপলোড করুন (প্রতিটি +১৫০ টাকা)
                        </Label>
                        <span className="text-sm text-gray-500">
                          সর্বোচ্চ ৩টি ছবি
                        </span>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || customization.images.length >= 3}
                        className="w-full h-16 border-2 border-dashed"
                      >
                        {isUploading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            আপলোড হচ্ছে...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6" />
                            ছবি নির্বাচন করুন
                          </div>
                        )}
                      </Button>

                      {/* Image Preview */}
                      {customization.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {customization.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Custom ${index + 1}`}
                                className="w-full aspect-square object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Extras */}
                  <TabsContent value="extras" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Gift className="w-5 h-5 text-pink-500" />
                          <div>
                            <h4 className="font-medium">গিফট র‍্যাপিং</h4>
                            <p className="text-sm text-gray-600">সুন্দর গিফট র‍্যাপিং (+৮০ টাকা)</p>
                          </div>
                        </div>
                        <Button
                          variant={customization.giftWrap ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCustomization(prev => ({ 
                            ...prev, 
                            giftWrap: !prev.giftWrap 
                          }))}
                        >
                          {customization.giftWrap ? 'যোগ করা হয়েছে' : 'যোগ করুন'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium">দ্রুত ডেলিভারি</h4>
                            <p className="text-sm text-gray-600">২৪ ঘণ্টার মধ্যে ডেলিভারি (+১২০ টাকা)</p>
                          </div>
                        </div>
                        <Button
                          variant={customization.expressDelivery ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCustomization(prev => ({ 
                            ...prev, 
                            expressDelivery: !prev.expressDelivery 
                          }))}
                        >
                          {customization.expressDelivery ? 'যোগ করা হয়েছে' : 'যোগ করুন'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        বিশেষ নির্দেশনা
                      </Label>
                      <Textarea
                        placeholder="কোনো বিশেষ নির্দেশনা থাকলে এখানে লিখুন..."
                        value={customization.specialInstructions}
                        onChange={(e) => setCustomization(prev => ({ 
                          ...prev, 
                          specialInstructions: e.target.value 
                        }))}
                        className="min-h-[120px]"
                        maxLength={500}
                      />
                      <div className="text-sm text-gray-500">
                        {customization.specialInstructions.length}/500 অক্ষর
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  মোট: {formatPrice(totalPrice)}
                </div>
                <div className="text-sm text-gray-600">
                  মূল দাম: {formatPrice(basePrice)} + কাস্টমাইজেশন: {formatPrice(totalPrice - (basePrice * customization.quantity))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="min-w-[120px]"
                >
                  বাতিল
                </Button>

                <Button
                  onClick={handleAddToCart}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white min-w-[180px]"
                  data-testid="button-add-to-cart-customized"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  কার্টে যোগ করুন
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}