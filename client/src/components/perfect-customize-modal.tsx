import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import PerfectModalBase from '@/components/perfect-modals/perfect-modal-base';
import { 
  Palette, 
  Upload, 
  X, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Sparkles, 
  Type, 
  Image as ImageIcon, 
  Ruler, 
  Heart,
  Star,
  Gift,
  Brush,
  Layers,
  Move3D,
  Zap
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

interface CustomizationOptions {
  size: 'small' | 'medium' | 'large' | 'xl';
  color: string;
  material: string;
  text: string;
  font: string;
  textColor: string;
  quantity: number;
  images: string[];
  engraving: string;
  gift_wrap: boolean;
  express_delivery: boolean;
  special_instructions: string;
}

interface PerfectCustomizeModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, customization: CustomizationOptions) => void;
}

const defaultCustomization: CustomizationOptions = {
  size: 'medium',
  color: '#000000',
  material: 'standard',
  text: '',
  font: 'bangla-default',
  textColor: '#000000',
  quantity: 1,
  images: [],
  engraving: '',
  gift_wrap: false,
  express_delivery: false,
  special_instructions: ''
};

const colorOptions = [
  { name: 'কালো', value: '#000000' },
  { name: 'সাদা', value: '#FFFFFF' },
  { name: 'লাল', value: '#DC2626' },
  { name: 'নীল', value: '#2563EB' },
  { name: 'সবুজ', value: '#16A34A' },
  { name: 'গোলাপি', value: '#EC4899' },
  { name: 'হলুদ', value: '#EAB308' },
  { name: 'বেগুনি', value: '#9333EA' },
  { name: 'কমলা', value: '#EA580C' },
  { name: 'বাদামী', value: '#A3A3A3' }
];

const sizeOptions = [
  { value: 'small', label: 'ছোট', price: 0 },
  { value: 'medium', label: 'মাঝারি', price: 50 },
  { value: 'large', label: 'বড়', price: 100 },
  { value: 'xl', label: 'অতিরিক্ত বড়', price: 200 }
];

const materialOptions = [
  { value: 'standard', label: 'স্ট্যান্ডার্ড', price: 0 },
  { value: 'premium', label: 'প্রিমিয়াম', price: 150 },
  { value: 'luxury', label: 'লাক্সারি', price: 300 }
];

const fontOptions = [
  { value: 'bangla-default', label: 'বাংলা ডিফল্ট' },
  { value: 'bangla-bold', label: 'বাংলা বোল্ড' },
  { value: 'english-serif', label: 'ইংরেজি সেরিফ' },
  { value: 'english-sans', label: 'ইংরেজি স্যান্স' },
  { value: 'decorative', label: 'ডেকোরেটিভ' }
];

export default function PerfectCustomizeModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: PerfectCustomizeModalProps) {
  const [customization, setCustomization] = useState<CustomizationOptions>(defaultCustomization);
  const [activeTab, setActiveTab] = useState('basic');
  const [previewMode, setPreviewMode] = useState('2d');
  const [totalPrice, setTotalPrice] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    calculateTotalPrice();
  }, [customization, product]);

  const calculateTotalPrice = () => {
    const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    let additionalCost = 0;

    // Size cost
    const sizeOption = sizeOptions.find(s => s.value === customization.size);
    if (sizeOption) additionalCost += sizeOption.price;

    // Material cost
    const materialOption = materialOptions.find(m => m.value === customization.material);
    if (materialOption) additionalCost += materialOption.price;

    // Text engraving cost
    if (customization.text.length > 0) additionalCost += 100;
    if (customization.engraving.length > 0) additionalCost += 150;

    // Gift wrap cost
    if (customization.gift_wrap) additionalCost += 50;

    // Express delivery cost
    if (customization.express_delivery) additionalCost += 200;

    const total = (basePrice + additionalCost) * customization.quantity;
    setTotalPrice(total);
  };

  const updateCustomization = (key: keyof CustomizationOptions, value: any) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setCustomization(prev => ({
                ...prev,
                images: [...prev.images, ...newImages].slice(0, 5) // Max 5 images
              }));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddToCart = () => {
    onAddToCart(product, customization);
    toast({
      title: "কাস্টমাইজড পণ্য কার্টে যোগ হয়েছে!",
      description: `${customization.quantity} টি "${product.name}" কাস্টমাইজেশন সহ`,
      duration: 3000,
    });
    onClose();
  };

  const resetCustomization = () => {
    setCustomization(defaultCustomization);
  };

  return (
    <PerfectModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`কাস্টমাইজ করুন - ${product.name}`}
      maxWidth="max-w-[96vw] sm:max-w-[92vw] md:max-w-[88vw] lg:max-w-[85vw] xl:max-w-[82vw] 2xl:max-w-7xl"
      className="h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[80vh]"
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-4 md:p-6 h-full overflow-y-auto scrollbar-hide">
        {/* Left Side - Product Preview */}
        <div className="space-y-4 lg:space-y-6">
          <Card className="overflow-hidden sticky top-4">
            <CardHeader className="pb-3 lg:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                  প্রিভিউ
                </CardTitle>
                <div className="flex gap-1 lg:gap-2">
                  <Button
                    variant={previewMode === '2d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('2d')}
                    className="text-xs lg:text-sm px-2 lg:px-3"
                  >
                    2D
                  </Button>
                  <Button
                    variant={previewMode === '3d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('3d')}
                    className="text-xs lg:text-sm px-2 lg:px-3"
                  >
                    <Move3D className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                    3D
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mb-3 lg:mb-4 overflow-hidden relative">
                {product.image_url ? (
                  <div className="relative w-full h-full">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      style={{
                        filter: `brightness(1) contrast(1) ${customization.color !== '#000000' ? `hue-rotate(${customization.color === '#DC2626' ? '0deg' : customization.color === '#2563EB' ? '240deg' : '120deg'})` : ''}`
                      }}
                    />
                    {customization.text && (
                      <div 
                        className="absolute bottom-4 left-4 right-4 text-center p-2 bg-white/90 rounded"
                        style={{ 
                          color: customization.textColor,
                          fontFamily: customization.font.includes('bangla') ? 'system-ui' : 'serif',
                          fontWeight: customization.font.includes('bold') ? 'bold' : 'normal'
                        }}
                      >
                        {customization.text}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                    <p>প্রোডাক্ট ইমেজ</p>
                  </div>
                )}
              </div>
              
              {/* Customization Summary */}
              <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">সাইজ:</span>
                  <Badge variant="secondary" className="text-xs">
                    {sizeOptions.find(s => s.value === customization.size)?.label}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">রং:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 lg:w-4 lg:h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: customization.color }}
                    />
                    <span className="text-xs lg:text-sm">
                      {colorOptions.find(c => c.value === customization.color)?.name || 'কাস্টম'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ম্যাটেরিয়াল:</span>
                  <Badge variant="outline" className="text-xs">
                    {materialOptions.find(m => m.value === customization.material)?.label}
                  </Badge>
                </div>
                {customization.text && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">টেক্সট:</span>
                    <span className="font-medium text-xs lg:text-sm truncate max-w-24">
                      {customization.text}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">পরিমাণ:</span>
                  <Badge className="bg-primary text-xs">{customization.quantity} টি</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="w-5 h-5 text-green-600" />
                মূল্য বিবরণ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>মূল দাম:</span>
                <span>{formatPrice(typeof product.price === 'string' ? parseFloat(product.price) : product.price)}</span>
              </div>
              
              {(() => {
                const sizeOption = sizeOptions.find(s => s.value === customization.size);
                return sizeOption?.price && sizeOption.price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>সাইজ ({sizeOption.label}):</span>
                    <span>+{formatPrice(sizeOption.price)}</span>
                  </div>
                );
              })()}
              
              {(() => {
                const materialOption = materialOptions.find(m => m.value === customization.material);
                return materialOption?.price && materialOption.price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>ম্যাটেরিয়াল ({materialOption.label}):</span>
                    <span>+{formatPrice(materialOption.price)}</span>
                  </div>
                );
              })()}
              
              {customization.text && (
                <div className="flex justify-between text-sm">
                  <span>টেক্সট প্রিন্টিং:</span>
                  <span>+{formatPrice(100)}</span>
                </div>
              )}
              
              {customization.engraving && (
                <div className="flex justify-between text-sm">
                  <span>এনগ্রেভিং:</span>
                  <span>+{formatPrice(150)}</span>
                </div>
              )}
              
              {customization.gift_wrap && (
                <div className="flex justify-between text-sm">
                  <span>গিফট র্যাপিং:</span>
                  <span>+{formatPrice(50)}</span>
                </div>
              )}
              
              {customization.express_delivery && (
                <div className="flex justify-between text-sm">
                  <span>এক্সপ্রেস ডেলিভারি:</span>
                  <span>+{formatPrice(200)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>মোট দাম:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Customization Options */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="basic" className="text-xs lg:text-sm flex-col gap-1 h-auto py-2">
                <Palette className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">বেসিক</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs lg:text-sm flex-col gap-1 h-auto py-2">
                <Type className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">টেক্সট</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs lg:text-sm flex-col gap-1 h-auto py-2">
                <Layers className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">অ্যাডভান্স</span>
              </TabsTrigger>
              <TabsTrigger value="extras" className="text-xs lg:text-sm flex-col gap-1 h-auto py-2">
                <Zap className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">এক্সট্রা</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Customization */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    সাইজ নির্বাচন
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={customization.size} 
                    onValueChange={(value) => updateCustomization('size', value)}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {sizeOptions.map((size) => (
                        <Label
                          key={size.value}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                            customization.size === size.value ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                        >
                          <RadioGroupItem value={size.value} />
                          <div className="flex-1">
                            <div className="font-medium">{size.label}</div>
                            {size.price > 0 && (
                              <div className="text-sm text-green-600">+{formatPrice(size.price)}</div>
                            )}
                          </div>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    রং নির্বাচন
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center ${
                          customization.color === color.value ? 'border-primary' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => updateCustomization('color', color.value)}
                        title={color.name}
                      >
                        {customization.color === color.value && (
                          <div className={`w-2 h-2 rounded-full ${color.value === '#FFFFFF' ? 'bg-black' : 'bg-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="custom-color">কাস্টম রং:</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="custom-color"
                        type="color"
                        value={customization.color}
                        onChange={(e) => updateCustomization('color', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={customization.color}
                        onChange={(e) => updateCustomization('color', e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brush className="w-5 h-5" />
                    ম্যাটেরিয়াল
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={customization.material} 
                    onValueChange={(value) => updateCustomization('material', value)}
                  >
                    <div className="space-y-3">
                      {materialOptions.map((material) => (
                        <Label
                          key={material.value}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                            customization.material === material.value ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={material.value} />
                            <span className="font-medium">{material.label}</span>
                          </div>
                          {material.price > 0 && (
                            <Badge variant="outline" className="text-green-600">
                              +{formatPrice(material.price)}
                            </Badge>
                          )}
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Text Customization */}
            <TabsContent value="text" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    টেক্সট কাস্টমাইজেশন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="custom-text">আপনার টেক্সট লিখুন:</Label>
                    <Input
                      id="custom-text"
                      value={customization.text}
                      onChange={(e) => updateCustomization('text', e.target.value)}
                      placeholder="এখানে আপনার টেক্সট লিখুন..."
                      maxLength={50}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">{customization.text.length}/50 অক্ষর</p>
                  </div>

                  <div>
                    <Label>ফন্ট নির্বাচন:</Label>
                    <RadioGroup 
                      value={customization.font} 
                      onValueChange={(value) => updateCustomization('font', value)}
                      className="mt-2"
                    >
                      <div className="grid grid-cols-1 gap-2">
                        {fontOptions.map((font) => (
                          <Label
                            key={font.value}
                            className={`flex items-center space-x-3 p-2 rounded border cursor-pointer hover:bg-gray-50 ${
                              customization.font === font.value ? 'border-primary bg-primary/5' : 'border-gray-200'
                            }`}
                          >
                            <RadioGroupItem value={font.value} />
                            <span>{font.label}</span>
                          </Label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="text-color">টেক্সটের রং:</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={customization.textColor}
                        onChange={(e) => updateCustomization('textColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={customization.textColor}
                        onChange={(e) => updateCustomization('textColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="engraving">এনগ্রেভিং টেক্সট:</Label>
                    <Input
                      id="engraving"
                      value={customization.engraving}
                      onChange={(e) => updateCustomization('engraving', e.target.value)}
                      placeholder="এনগ্রেভিংয়ের জন্য টেক্সট (ঐচ্ছিক)"
                      maxLength={30}
                      className="mt-2"
                    />
                    {customization.engraving && (
                      <p className="text-sm text-green-600 mt-1">+{formatPrice(150)} এনগ্রেভিং খরচ</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Customization */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    ইমেজ আপলোড
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload-advanced"
                      />
                      <label htmlFor="image-upload-advanced" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          রেফারেন্স ইমেজ আপলোড করুন (সর্বোচ্চ ৫টি)
                        </p>
                      </label>
                    </div>

                    {customization.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {customization.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>বিশেষ নির্দেশনা</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={customization.special_instructions}
                    onChange={(e) => updateCustomization('special_instructions', e.target.value)}
                    placeholder="বিশেষ কোনো নির্দেশনা থাকলে এখানে লিখুন..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Extras */}
            <TabsContent value="extras" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    অতিরিক্ত সেবা
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={customization.gift_wrap}
                        onCheckedChange={(checked) => updateCustomization('gift_wrap', checked)}
                      />
                      <div>
                        <div className="font-medium">গিফট র্যাপিং</div>
                        <div className="text-sm text-gray-600">সুন্দর গিফট প্যাকেজিং</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">+{formatPrice(50)}</Badge>
                  </Label>

                  <Label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={customization.express_delivery}
                        onCheckedChange={(checked) => updateCustomization('express_delivery', checked)}
                      />
                      <div>
                        <div className="font-medium">এক্সপ্রেস ডেলিভারি</div>
                        <div className="text-sm text-gray-600">২৪ ঘণ্টার মধ্যে ডেলিভারি</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">+{formatPrice(200)}</Badge>
                  </Label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>পরিমাণ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCustomization('quantity', Math.max(1, customization.quantity - 1))}
                      disabled={customization.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="text-2xl font-bold w-16 text-center">
                      {customization.quantity}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCustomization('quantity', Math.min(10, customization.quantity + 1))}
                      disabled={customization.quantity >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    সর্বোচ্চ ১০ টি
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 sticky bottom-0 bg-white pt-4 border-t mt-6">
            <Button
              variant="outline"
              className="flex-1 order-3 sm:order-1"
              onClick={resetCustomization}
            >
              রিসেট
            </Button>
            <Button
              variant="outline" 
              className="flex-1 order-2"
              onClick={onClose}
            >
              বাতিল
            </Button>
            <Button
              className="flex-1 order-1 sm:order-3 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
              কার্টে যোগ করুন
            </Button>
          </div>
        </div>
      </div>
    </PerfectModalBase>
  );
}