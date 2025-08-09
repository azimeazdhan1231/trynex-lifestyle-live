import { useState, useEffect, useRef } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  X, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Camera, 
  Palette, 
  Ruler,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Star,
  Heart,
  Zap,
  Package,
  Home,
  Search,
  User,
  Menu,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  Truck,
  Shield
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import type { Product, InsertCustomOrder } from "@shared/schema";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";

// Enhanced Customization Options
const PRODUCT_TYPES = {
  "T-Shirts": {
    sizes: [
      { value: 'XS', label: 'XS (২৮")', price: 0 },
      { value: 'S', label: 'S (৩০")', price: 0 },
      { value: 'M', label: 'M (৩২")', price: 0 },
      { value: 'L', label: 'L (৩৪")', price: 0 },
      { value: 'XL', label: 'XL (৩৬")', price: 50 },
      { value: 'XXL', label: 'XXL (৩৮")', price: 100 }
    ],
    colors: [
      { value: 'white', label: 'সাদা', hex: '#ffffff', price: 0 },
      { value: 'black', label: 'কালো', hex: '#000000', price: 0 },
      { value: 'red', label: 'লাল', hex: '#ef4444', price: 25 },
      { value: 'blue', label: 'নীল', hex: '#3b82f6', price: 25 },
      { value: 'green', label: 'সবুজ', hex: '#10b981', price: 25 },
      { value: 'navy', label: 'নেভি ব্লু', hex: '#1e40af', price: 25 }
    ],
    printAreas: [
      { value: 'front', label: 'সামনে', price: 0 },
      { value: 'back', label: 'পিছনে', price: 100 },
      { value: 'both', label: 'উভয় পাশে', price: 180 },
      { value: 'sleeve', label: 'হাতায়', price: 80 }
    ],
    materials: [
      { value: 'cotton', label: '১০০% সুতি', price: 0 },
      { value: 'polyester', label: 'পলিয়েস্টার মিশ্রণ', price: 50 },
      { value: 'premium', label: 'প্রিমিয়াম সুতি', price: 150 }
    ]
  },
  "Mugs": {
    sizes: [
      { value: '11oz', label: '১১ oz (৩২৫ মিলি)', price: 0 },
      { value: '15oz', label: '১৫ oz (৪৪৪ মিলি)', price: 80 },
      { value: '20oz', label: '২০ oz (৫৯১ মিলি)', price: 150 }
    ],
    colors: [
      { value: 'white', label: 'সাদা', hex: '#ffffff', price: 0 },
      { value: 'black', label: 'কালো', hex: '#000000', price: 50 },
      { value: 'blue', label: 'নীল', hex: '#3b82f6', price: 30 },
      { value: 'red', label: 'লাল', hex: '#ef4444', price: 30 }
    ],
    printAreas: [
      { value: 'front', label: 'সামনে', price: 0 },
      { value: 'back', label: 'পিছনে', price: 80 },
      { value: 'wrap', label: 'চারপাশে', price: 120 }
    ],
    materials: [
      { value: 'ceramic', label: 'সিরামিক', price: 0 },
      { value: 'stainless', label: 'স্টেইনলেস স্টিল', price: 200 }
    ]
  }
};

const DELIVERY_OPTIONS = [
  { value: 'standard', label: 'স্ট্যান্ডার্ড ডেলিভারি (৫-৭ দিন)', price: 0 },
  { value: 'express', label: 'এক্সপ্রেস ডেলিভারি (২-৩ দিন)', price: 150 },
  { value: 'urgent', label: 'জরুরি ডেলিভারি (১ দিন)', price: 300 }
];

const PAYMENT_METHODS = [
  { value: 'cod', label: 'ক্যাশ অন ডেলিভারি', fee: 0 },
  { value: 'bkash', label: 'বিকাশ', fee: 0 },
  { value: 'nagad', label: 'নগদ', fee: 0 },
  { value: 'rocket', label: 'রকেট', fee: 0 }
];

export default function EnhancedCustomizeProduct() {
  const [match, params] = useRoute('/customize/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced form state
  const [customization, setCustomization] = useState({
    // Product options
    size: '',
    color: '',
    material: '',
    printArea: '',
    quantity: 1,
    
    // Design options
    customText: '',
    fontSize: [16],
    fontFamily: 'arial',
    textColor: '#000000',
    customImages: [] as File[],
    designPosition: 'center',
    
    // Delivery & Payment
    deliveryOption: 'standard',
    paymentMethod: 'cod',
    urgentDeadline: '',
    
    // Customer info
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    specialInstructions: '',
    
    // Advanced options
    giftWrap: false,
    giftMessage: '',
    bulkDiscount: false
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [priceBreakdown, setPriceBreakdown] = useState({
    basePrice: 0,
    sizePrice: 0,
    colorPrice: 0,
    materialPrice: 0,
    printAreaPrice: 0,
    deliveryPrice: 0,
    customTextPrice: 0,
    customImagePrice: 0,
    giftWrapPrice: 0,
    total: 0
  });

  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['/api/products', params?.id],
    enabled: !!params?.id
  });

  // Calculate pricing dynamically
  useEffect(() => {
    if (!product) return;

    const basePrice = Number(product.price);
    const productType = getProductType(product.name);
    const options = PRODUCT_TYPES[productType];
    
    if (!options) return;

    const sizePrice = options.sizes.find(s => s.value === customization.size)?.price || 0;
    const colorPrice = options.colors.find(c => c.value === customization.color)?.price || 0;
    const materialPrice = options.materials.find(m => m.value === customization.material)?.price || 0;
    const printAreaPrice = options.printAreas.find(p => p.value === customization.printArea)?.price || 0;
    const deliveryPrice = DELIVERY_OPTIONS.find(d => d.value === customization.deliveryOption)?.price || 0;
    const customTextPrice = customization.customText.trim() ? 100 : 0;
    const customImagePrice = customization.customImages.length * 150;
    const giftWrapPrice = customization.giftWrap ? 50 : 0;
    
    const subtotal = (basePrice + sizePrice + colorPrice + materialPrice + printAreaPrice + customTextPrice + customImagePrice + giftWrapPrice) * customization.quantity;
    const total = subtotal + deliveryPrice;

    setPriceBreakdown({
      basePrice,
      sizePrice,
      colorPrice,
      materialPrice,
      printAreaPrice,
      deliveryPrice,
      customTextPrice,
      customImagePrice,
      giftWrapPrice,
      total
    });
  }, [product, customization]);

  const getProductType = (productName: string): keyof typeof PRODUCT_TYPES => {
    const name = productName.toLowerCase();
    if (name.includes('mug') || name.includes('মগ')) return 'Mugs';
    return 'T-Shirts'; // Default
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (customization.customImages.length + files.length > 5) {
      toast({
        title: "সর্বোচ্চ ৫টি ছবি",
        description: "আপনি সর্বোচ্চ ৫টি ছবি আপলোড করতে পারবেন",
        variant: "destructive"
      });
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ফাইল খুব বড়",
          description: "দয়া করে ৫MB এর কম সাইজের ছবি আপলোড করুন",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setCustomization(prev => ({
      ...prev,
      customImages: [...prev.customImages, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      customImages: prev.customImages.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  // Enhanced order placement
  const createCustomOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "অর্ডার সফল!",
        description: "আপনার কাস্টম অর্ডারটি সফলভাবে প্রেরণ করা হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।"
      });
      setLocation('/orders');
    },
    onError: (error) => {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "অর্ডার প্রেরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  });

  const handlePlaceOrder = async () => {
    // Validation
    if (!customization.customerName || !customization.customerPhone) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "দয়া করে নাম এবং ফোন নম্বর দিন",
        variant: "destructive"
      });
      return;
    }

    if (!customization.size || !customization.color) {
      toast({
        title: "বিকল্প নির্বাচন করুন",
        description: "দয়া করে সাইজ এবং রং নির্বাচন করুন",
        variant: "destructive"
      });
      return;
    }

    // Convert images to base64
    const imagePromises = customization.customImages.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const imageBase64Array = await Promise.all(imagePromises);
      
      const orderData = {
        productId: product!.id,
        customerName: customization.customerName,
        customerPhone: customization.customerPhone,
        customerEmail: customization.customerEmail || '',
        customerAddress: customization.customerAddress || '',
        customizationData: JSON.stringify({
          ...customization,
          customImages: imageBase64Array
        }),
        totalPrice: priceBreakdown.total.toString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      createCustomOrderMutation.mutate(orderData);
    } catch (error) {
      toast({
        title: "ছবি প্রক্রিয়াকরণে সমস্যা",
        description: "ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppOrder = () => {
    const orderDetails = `
🎨 কাস্টম অর্ডার:
পণ্য: ${product?.name}
সাইজ: ${customization.size}
রং: ${customization.color}
পরিমাণ: ${customization.quantity}
মোট দাম: ${formatPrice(priceBreakdown.total)}

📞 নাম: ${customization.customerName}
📱 ফোন: ${customization.customerPhone}

${customization.specialInstructions ? `📝 বিশেষ নির্দেশনা: ${customization.specialInstructions}` : ''}
    `.trim();

    window.open(createWhatsAppUrl(orderDetails), '_blank');
  };

  if (isLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  if (error || !product) {
    return (
      <MobileOptimizedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">পণ্য পাওয়া যায়নি</h2>
              <p className="text-gray-600 mb-4">দুঃখিত, আপনার খোঁজা পণ্যটি পাওয়া যায়নি।</p>
              <Button onClick={() => setLocation('/products')}>
                পণ্যের তালিকায় ফিরুন
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileOptimizedLayout>
    );
  }

  const productType = getProductType(product.name);
  const options = PRODUCT_TYPES[productType];

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/products')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                ফিরে যান
              </Button>
              <h1 className="text-lg font-semibold">কাস্টমাইজ করুন</h1>
              <div className="w-20" /> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={product.image_url || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  
                  {/* Price Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium mb-2">দাম বিবরণী:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>মূল দাম:</span>
                        <span>{formatPrice(priceBreakdown.basePrice)}</span>
                      </div>
                      {priceBreakdown.sizePrice > 0 && (
                        <div className="flex justify-between">
                          <span>সাইজ চার্জ:</span>
                          <span>{formatPrice(priceBreakdown.sizePrice)}</span>
                        </div>
                      )}
                      {priceBreakdown.colorPrice > 0 && (
                        <div className="flex justify-between">
                          <span>রং চার্জ:</span>
                          <span>{formatPrice(priceBreakdown.colorPrice)}</span>
                        </div>
                      )}
                      {priceBreakdown.printAreaPrice > 0 && (
                        <div className="flex justify-between">
                          <span>প্রিন্ট এরিয়া:</span>
                          <span>{formatPrice(priceBreakdown.printAreaPrice)}</span>
                        </div>
                      )}
                      {priceBreakdown.customTextPrice > 0 && (
                        <div className="flex justify-between">
                          <span>কাস্টম টেক্সট:</span>
                          <span>{formatPrice(priceBreakdown.customTextPrice)}</span>
                        </div>
                      )}
                      {priceBreakdown.customImagePrice > 0 && (
                        <div className="flex justify-between">
                          <span>কাস্টম ছবি:</span>
                          <span>{formatPrice(priceBreakdown.customImagePrice)}</span>
                        </div>
                      )}
                      {priceBreakdown.deliveryPrice > 0 && (
                        <div className="flex justify-between">
                          <span>ডেলিভারি চার্জ:</span>
                          <span>{formatPrice(priceBreakdown.deliveryPrice)}</span>
                        </div>
                      )}
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>মোট:</span>
                        <span className="text-green-600">{formatPrice(priceBreakdown.total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customization Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Basic Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</div>
                    মৌলিক বিকল্প
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Size Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">সাইজ নির্বাচন করুন *</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {options.sizes.map(size => (
                        <Button
                          key={size.value}
                          variant={customization.size === size.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCustomization(prev => ({ ...prev, size: size.value }))}
                          className="text-xs"
                        >
                          {size.label}
                          {size.price > 0 && (
                            <span className="text-xs ml-1">+{formatPrice(size.price)}</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">রং নির্বাচন করুন *</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {options.colors.map(color => (
                        <div
                          key={color.value}
                          className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all ${
                            customization.color === color.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                        >
                          <div
                            className="w-8 h-8 rounded-full mx-auto mb-1 border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <p className="text-xs text-center">{color.label}</p>
                          {color.price > 0 && (
                            <p className="text-xs text-center text-green-600">+{formatPrice(color.price)}</p>
                          )}
                          {customization.color === color.value && (
                            <CheckCircle className="w-4 h-4 text-blue-500 absolute top-1 right-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Material Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">উপাদান নির্বাচন করুন</Label>
                    <RadioGroup
                      value={customization.material}
                      onValueChange={(value) => setCustomization(prev => ({ ...prev, material: value }))}
                    >
                      {options.materials.map(material => (
                        <div key={material.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={material.value} id={material.value} />
                          <Label htmlFor={material.value} className="flex-1 cursor-pointer">
                            {material.label}
                            {material.price > 0 && (
                              <span className="text-green-600 ml-2">+{formatPrice(material.price)}</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Print Area */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">প্রিন্ট এরিয়া নির্বাচন করুন</Label>
                    <Select
                      value={customization.printArea}
                      onValueChange={(value) => setCustomization(prev => ({ ...prev, printArea: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="প্রিন্ট এরিয়া নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.printAreas.map(area => (
                          <SelectItem key={area.value} value={area.value}>
                            {area.label}
                            {area.price > 0 && ` (+${formatPrice(area.price)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">পরিমাণ</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomization(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-medium min-w-[3ch] text-center">{customization.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomization(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Design Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">2</div>
                    ডিজাইন কাস্টমাইজেশন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Custom Text */}
                  <div>
                    <Label htmlFor="customText" className="text-sm font-medium mb-2 block">
                      কাস্টম টেক্সট (+১০০ টাকা)
                    </Label>
                    <Textarea
                      id="customText"
                      placeholder="আপনার কাস্টম টেক্সট লিখুন..."
                      value={customization.customText}
                      onChange={(e) => setCustomization(prev => ({ ...prev, customText: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {customization.customText.trim() && (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Font Size */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">ফন্ট সাইজ</Label>
                        <Slider
                          value={customization.fontSize}
                          onValueChange={(value) => setCustomization(prev => ({ ...prev, fontSize: value }))}
                          min={12}
                          max={48}
                          step={2}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">{customization.fontSize[0]}px</p>
                      </div>

                      {/* Text Color */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">টেক্সট রং</Label>
                        <input
                          type="color"
                          value={customization.textColor}
                          onChange={(e) => setCustomization(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-full h-10 rounded border"
                        />
                      </div>
                    </div>
                  )}

                  {/* Font Family */}
                  {customization.customText.trim() && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">ফন্ট স্টাইল</Label>
                      <Select
                        value={customization.fontFamily}
                        onValueChange={(value) => setCustomization(prev => ({ ...prev, fontFamily: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ফন্ট নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arial">Arial</SelectItem>
                          <SelectItem value="helvetica">Helvetica</SelectItem>
                          <SelectItem value="times">Times New Roman</SelectItem>
                          <SelectItem value="georgia">Georgia</SelectItem>
                          <SelectItem value="verdana">Verdana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      কাস্টম ছবি আপলোড (+১৫০ টাকা প্রতিটি, সর্বোচ্চ ৫টি)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        ছবি আপলোড করুন
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF (সর্বোচ্চ 5MB)</p>
                    </div>

                    {/* Image Preview */}
                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full aspect-square object-cover rounded border"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 w-6 h-6 p-0"
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

              {/* Step 3: Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">3</div>
                    গ্রাহক তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName" className="text-sm font-medium mb-2 block">নাম *</Label>
                      <Input
                        id="customerName"
                        placeholder="আপনার পূর্ণ নাম"
                        value={customization.customerName}
                        onChange={(e) => setCustomization(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customerPhone" className="text-sm font-medium mb-2 block">ফোন নম্বর *</Label>
                      <Input
                        id="customerPhone"
                        placeholder="০১৭xxxxxxxx"
                        value={customization.customerPhone}
                        onChange={(e) => setCustomization(prev => ({ ...prev, customerPhone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customerEmail" className="text-sm font-medium mb-2 block">ইমেইল</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="example@email.com"
                      value={customization.customerEmail}
                      onChange={(e) => setCustomization(prev => ({ ...prev, customerEmail: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerAddress" className="text-sm font-medium mb-2 block">ঠিকানা</Label>
                    <Textarea
                      id="customerAddress"
                      placeholder="সম্পূর্ণ ঠিকানা লিখুন..."
                      value={customization.customerAddress}
                      onChange={(e) => setCustomization(prev => ({ ...prev, customerAddress: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Delivery & Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">4</div>
                    ডেলিভারি ও পেমেন্ট
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Delivery Options */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">ডেলিভারি অপশন</Label>
                    <RadioGroup
                      value={customization.deliveryOption}
                      onValueChange={(value) => setCustomization(prev => ({ ...prev, deliveryOption: value }))}
                    >
                      {DELIVERY_OPTIONS.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                            {option.label}
                            {option.price > 0 && (
                              <span className="text-green-600 ml-2">+{formatPrice(option.price)}</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">পেমেন্ট পদ্ধতি</Label>
                    <RadioGroup
                      value={customization.paymentMethod}
                      onValueChange={(value) => setCustomization(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      {PAYMENT_METHODS.map(method => (
                        <div key={method.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={method.value} id={method.value} />
                          <Label htmlFor={method.value} className="flex-1 cursor-pointer">
                            {method.label}
                            {method.fee > 0 && (
                              <span className="text-red-600 ml-2">+{formatPrice(method.fee)}</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Gift Options */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="giftWrap"
                      checked={customization.giftWrap}
                      onCheckedChange={(checked) => setCustomization(prev => ({ ...prev, giftWrap: checked as boolean }))}
                    />
                    <Label htmlFor="giftWrap" className="cursor-pointer">
                      গিফট র্যাপিং (+৫০ টাকা)
                    </Label>
                  </div>

                  {customization.giftWrap && (
                    <div>
                      <Label htmlFor="giftMessage" className="text-sm font-medium mb-2 block">গিফট মেসেজ</Label>
                      <Textarea
                        id="giftMessage"
                        placeholder="আপনার গিফট মেসেজ লিখুন..."
                        value={customization.giftMessage}
                        onChange={(e) => setCustomization(prev => ({ ...prev, giftMessage: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Special Instructions */}
                  <div>
                    <Label htmlFor="specialInstructions" className="text-sm font-medium mb-2 block">বিশেষ নির্দেশনা</Label>
                    <Textarea
                      id="specialInstructions"
                      placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                      value={customization.specialInstructions}
                      onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={createCustomOrderMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  {createCustomOrderMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      অর্ডার প্রক্রিয়াধীন...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      অর্ডার করুন ({formatPrice(priceBreakdown.total)})
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleWhatsAppOrder}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 py-3"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp এ অর্ডার
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}