
import { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Palette, 
  Type, 
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Minus,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@shared/schema';

interface SimpleCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onOrderPlaced?: (trackingId: string) => void;
}

interface CustomizationOptions {
  size: string;
  color: string;
  material: string;
  customText: string;
  engraving: string;
  quantity: number;
  customImage: string | null;
}

const SIZES = [
  { value: 'xs', label: 'অতি ছোট (XS)', dimensions: '৮-১০ ইঞ্চি', price: 0 },
  { value: 's', label: 'ছোট (S)', dimensions: '১০-১২ ইঞ্চি', price: 0 },
  { value: 'm', label: 'মাঝারি (M)', dimensions: '১২-১৪ ইঞ্চি', price: 50 },
  { value: 'l', label: 'বড় (L)', dimensions: '১৪-১৬ ইঞ্চি', price: 100 },
  { value: 'xl', label: 'অতি বড় (XL)', dimensions: '১৬-১৮ ইঞ্চি', price: 150 },
  { value: 'xxl', label: 'দ্বিগুণ বড় (XXL)', dimensions: '১৮-২০ ইঞ্চি', price: 200 }
];

const COLORS = [
  { value: 'black', label: 'কালো', color: '#000000' },
  { value: 'white', label: 'সাদা', color: '#FFFFFF' },
  { value: 'red', label: 'লাল', color: '#EF4444' },
  { value: 'blue', label: 'নীল', color: '#3B82F6' },
  { value: 'green', label: 'সবুজ', color: '#10B981' },
  { value: 'pink', label: 'গোলাপি', color: '#EC4899' },
  { value: 'yellow', label: 'হলুদ', color: '#F59E0B' },
  { value: 'purple', label: 'বেগুনি', color: '#8B5CF6' }
];

const MATERIALS = [
  { value: 'cotton', label: 'তুলা', quality: 3, price: 0 },
  { value: 'premium-cotton', label: 'প্রিমিয়াম তুলা', quality: 4, price: 150 },
  { value: 'silk', label: 'রেশম', quality: 5, price: 300 },
  { value: 'polyester', label: 'পলিয়েস্টার', quality: 3, price: 80 },
  { value: 'premium-mix', label: 'প্রিমিয়াম মিক্স', quality: 5, price: 250 }
];

export default function SimpleCustomizeModal({ isOpen, onClose, product, onOrderPlaced }: SimpleCustomizeModalProps) {
  const { toast } = useToast();
  
  // Initialize customization state
  const [customization, setCustomization] = useState<CustomizationOptions>({
    size: 'm',
    color: 'black',
    material: 'cotton',
    customText: '',
    engraving: '',
    quantity: 1,
    customImage: null
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    specialInstructions: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    if (!product) return 0;

    const basePrice = Number(product.price) || 0;
    const sizePrice = SIZES.find(s => s.value === customization.size)?.price || 0;
    const materialPrice = MATERIALS.find(m => m.value === customization.material)?.price || 0;
    const customTextPrice = customization.customText ? 120 : 0;
    const engravingPrice = customization.engraving ? 200 : 0;

    const itemPrice = basePrice + sizePrice + materialPrice + customTextPrice + engravingPrice;
    return itemPrice * customization.quantity;
  }, [product, customization]);

  // Handle image upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'ভুল ফাইল টাইপ',
        description: 'দয়া করে একটি ইমেজ ফাইল নির্বাচন করুন',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'ফাইল অনেক বড়',
        description: 'দয়া করে ৫MB এর চেয়ে ছোট ইমেজ নির্বাচন করুন',
        variant: 'destructive'
      });
      return;
    }

    // Create file URL
    const imageUrl = URL.createObjectURL(file);
    setCustomization(prev => ({ ...prev, customImage: imageUrl }));
    
    toast({
      title: 'ইমেজ আপলোড সফল',
      description: 'আপনার কাস্টম ইমেজ যোগ করা হয়েছে'
    });
  }, [toast]);

  // Handle order submission
  const handleOrderSubmit = useCallback(async () => {
    if (!product) return;

    // Validate customer info
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: 'তথ্য অনুপস্থিত',
        description: 'দয়া করে সব প্রয়োজনীয় তথ্য দিন',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const trackingId = `TRK-${Date.now()}`;
      
      toast({
        title: 'অর্ডার সফল!',
        description: `আপনার ট্র্যাকিং ID: ${trackingId}`
      });

      if (onOrderPlaced) {
        onOrderPlaced(trackingId);
      }

      onClose();
    } catch (error) {
      toast({
        title: 'অর্ডার ব্যর্থ',
        description: 'দয়া করে আবার চেষ্টা করুন',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [product, customerInfo, toast, onOrderPlaced, onClose]);

  // Reset customization when modal closes
  const handleClose = useCallback(() => {
    if (customization.customImage) {
      URL.revokeObjectURL(customization.customImage);
    }
    setCustomization({
      size: 'm',
      color: 'black',
      material: 'cotton',
      customText: '',
      engraving: '',
      quantity: 1,
      customImage: null
    });
    setCustomerInfo({
      name: '',
      phone: '',
      address: '',
      specialInstructions: ''
    });
    onClose();
  }, [customization.customImage, onClose]);

  const totalPrice = useMemo(() => calculateTotalPrice(), [calculateTotalPrice]);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Palette className="w-6 h-6" />
            {product.name} কাস্টমাইজ করুন
          </DialogTitle>
          <p className="text-orange-100 text-sm">
            আপনার পছন্দ অনুযায়ী পণ্যটি সাজিয়ে নিন এবং দেখুন কেমন লাগছে
          </p>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Product Preview */}
          <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>প্রিভিউ</span>
                  <Badge className="bg-green-500 text-white">
                    মোট: {formatPrice(totalPrice)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-white rounded-lg overflow-hidden border-2 border-dashed border-gray-300 mb-4 relative">
                  {customization.customImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={customization.customImage}
                        alt="Custom Design"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          if (customization.customImage) {
                            URL.revokeObjectURL(customization.customImage);
                          }
                          setCustomization(prev => ({ ...prev, customImage: null }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <img
                      src={product.image_url || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      style={{
                        filter: customization.color !== 'black' ? `hue-rotate(${
                          customization.color === 'red' ? '0deg' :
                          customization.color === 'blue' ? '240deg' :
                          customization.color === 'green' ? '120deg' :
                          customization.color === 'yellow' ? '60deg' :
                          customization.color === 'purple' ? '280deg' :
                          customization.color === 'pink' ? '320deg' : '0deg'
                        })` : 'none'
                      }}
                    />
                  )}
                  
                  {/* Custom text overlay */}
                  {customization.customText && (
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      {customization.customText}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold">কাস্টমাইজেশন সারাংশ</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>সাইজ:</span>
                      <span>{SIZES.find(s => s.value === customization.size)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>উপাদান:</span>
                      <span>{MATERIALS.find(m => m.value === customization.material)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>রং:</span>
                      <span>{COLORS.find(c => c.value === customization.color)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>পরিমাণ:</span>
                      <span>{customization.quantity}টি</span>
                    </div>
                    <div className="flex justify-between">
                      <span>কাস্টম টেক্সট:</span>
                      <span>{customization.customText ? 'হ্যাঁ' : 'না'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>খোদাই:</span>
                      <span>{customization.engraving ? 'হ্যাঁ' : 'না'}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>মূল দাম:</span>
                      <span>{formatPrice(Number(product.price))}</span>
                    </div>
                    {SIZES.find(s => s.value === customization.size)?.price !== 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>সাইজ চার্জ ({SIZES.find(s => s.value === customization.size)?.label}):</span>
                        <span>+{formatPrice(SIZES.find(s => s.value === customization.size)?.price || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold">
                      <span>প্রতিটির দাম:</span>
                      <span>{formatPrice(totalPrice / customization.quantity)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Customization Options */}
          <div className="w-1/2 overflow-y-auto">
            <Tabs defaultValue="customize" className="h-full">
              <TabsList className="grid w-full grid-cols-2 mx-6 mt-4">
                <TabsTrigger value="customize">কাস্টমাইজ</TabsTrigger>
                <TabsTrigger value="order">অর্ডার তথ্য</TabsTrigger>
              </TabsList>

              <TabsContent value="customize" className="px-6 pb-6 space-y-6">
                {/* Size Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">সাইজ নির্বাচন করুন</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SIZES.map((size) => (
                      <div
                        key={size.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          customization.size === size.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCustomization(prev => ({ ...prev, size: size.value }))}
                      >
                        <div className="font-medium">{size.label}</div>
                        <div className="text-sm text-gray-600">{size.dimensions}</div>
                        {size.price > 0 && (
                          <div className="text-sm text-green-600">+{formatPrice(size.price)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">রং নির্বাচন করুন</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {COLORS.map((color) => (
                      <div
                        key={color.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center ${
                          customization.color === color.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300 mb-2"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-sm">{color.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">উপাদান নির্বাচন করুন</Label>
                  <div className="space-y-2">
                    {MATERIALS.map((material) => (
                      <div
                        key={material.value}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          customization.material === material.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCustomization(prev => ({ ...prev, material: material.value }))}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{material.label}</div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-600">গুণমান:</span>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < material.quality ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {material.price > 0 && (
                            <div className="text-green-600 font-medium">+{formatPrice(material.price)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Image Upload */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">কাস্টম ইমেজ আপলোড</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="custom-image-upload"
                    />
                    <label htmlFor="custom-image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <div className="text-sm font-medium">আপনার ইমেজ আপলোড করুন</div>
                        <div className="text-xs text-gray-600">PNG, JPG, JPEG (সর্বোচ্চ 5MB)</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Text Customization */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      টেক্সট কাস্টমাইজেশন
                    </Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-gray-600 mb-1 block">
                          কাস্টম টেক্সট (+১২০ টাকা)
                        </Label>
                        <Input
                          placeholder="আপনার টেক্সট লিখুন..."
                          value={customization.customText}
                          onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
                          maxLength={50}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {customization.customText.length}/50 অক্ষর
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-600 mb-1 block">
                          খোদাই (+২০০ টাকা)
                        </Label>
                        <Input
                          placeholder="খোদাইয়ের জন্য টেক্সট..."
                          value={customization.engraving}
                          onChange={(e) => setCustomization(prev => ({ ...prev, engraving: e.target.value }))}
                          maxLength={30}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {customization.engraving.length}/30 অক্ষর
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">পরিমাণ</Label>
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
                    <span className="w-12 text-center font-medium">{customization.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomization(prev => ({ 
                        ...prev, 
                        quantity: Math.min(10, prev.quantity + 1) 
                      }))}
                      disabled={customization.quantity >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="order" className="px-6 pb-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">নাম *</Label>
                    <Input
                      id="name"
                      placeholder="আপনার পূর্ণ নাম"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">ফোন নম্বর *</Label>
                    <Input
                      id="phone"
                      placeholder="01XXXXXXXXX"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">ঠিকানা *</Label>
                    <Textarea
                      id="address"
                      placeholder="আপনার সম্পূর্ণ ঠিকানা"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instructions">বিশেষ নির্দেশনা</Label>
                    <Textarea
                      id="instructions"
                      placeholder="কোন বিশেষ নির্দেশনা জানান এখানে লিখুন..."
                      value={customerInfo.specialInstructions}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      rows={3}
                      maxLength={200}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {customerInfo.specialInstructions.length}/200 অক্ষর
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(totalPrice)} সর্বমোট দাম
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                বাতিল
              </Button>
              <Button
                onClick={handleOrderSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isSubmitting ? 'প্রসেসিং...' : 'কার্টে যোগ করুন'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
