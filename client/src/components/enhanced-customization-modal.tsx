import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, Palette, Type, Download, RotateCcw, ZoomIn, 
  Move, ShoppingCart, Zap, Star, X, Camera, Paintbrush 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import OrderNowModal from "@/components/order-now-modal";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@shared/schema";

interface CustomizationData {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  position?: { x: number; y: number };
  rotation?: number;
  uploadedImage?: File | null;
  imagePreview?: string;
  instructions?: string;
  colorName?: string;
}

interface EnhancedCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const COLOR_PALETTE = [
  { name: 'কালো', value: '#000000' },
  { name: 'লাল', value: '#EF4444' },
  { name: 'নীল', value: '#3B82F6' },
  { name: 'সবুজ', value: '#10B981' },
  { name: 'হলুদ', value: '#F59E0B' },
  { name: 'গোলাপী', value: '#EC4899' },
  { name: 'বেগুনী', value: '#8B5CF6' },
  { name: 'কমলা', value: '#F97316' },
  { name: 'সাদা', value: '#FFFFFF' },
  { name: 'ধূসর', value: '#6B7280' }
];

const FONT_FAMILIES = [
  { name: 'ডিফল্ট', value: 'system-ui' },
  { name: 'সান্স সেরিফ', value: 'sans-serif' },
  { name: 'সেরিফ', value: 'serif' },
  { name: 'মনোস্পেস', value: 'monospace' },
];

export default function EnhancedCustomizationModal({ isOpen, onClose, product }: EnhancedCustomizationModalProps) {
  const [customization, setCustomization] = useState<CustomizationData>({
    fontSize: 18,
    fontFamily: 'system-ui',
    color: '#000000',
    backgroundColor: 'transparent',
    position: { x: 50, y: 40 },
    rotation: 0,
    colorName: 'কালো'
  });
  
  const [isOrderNowOpen, setIsOrderNowOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const customizationFee = 50;
  const totalPrice = Number(product.price) + customizationFee;

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "ফাইল খুব বড়",
          description: "অনুগ্রহ করে ৫MB এর ছোট ফাইল আপলোড করুন",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imagePreview = e.target?.result as string;
        setCustomization(prev => ({
          ...prev,
          uploadedImage: file,
          imagePreview
        }));
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "ছবি আপলোড সফল!",
        description: "আপনার ছবি সফলভাবে আপলোড হয়েছে",
      });
    }
  };

  // Handle color selection
  const handleColorSelect = (color: { name: string; value: string }) => {
    setCustomization(prev => ({
      ...prev,
      color: color.value,
      colorName: color.name
    }));
  };

  // Handle drag and drop for positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewRef.current) return;
    
    setIsDragging(true);
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCustomization(prev => ({
      ...prev,
      position: { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCustomization(prev => ({
      ...prev,
      position: { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset customization
  const resetCustomization = () => {
    setCustomization({
      fontSize: 18,
      fontFamily: 'system-ui',
      color: '#000000',
      backgroundColor: 'transparent',
      position: { x: 50, y: 40 },
      rotation: 0,
      colorName: 'কালো'
    });
  };

  // Add to cart with customization
  const handleAddToCart = () => {
    const customizedProduct = {
      id: `${product.id}-custom-${Date.now()}`,
      name: `${product.name} (কাস্টমাইজড)`,
      price: totalPrice,
      image_url: product.image_url || '',
      quantity: 1,
      customization: {
        ...customization,
        imagePreview: customization.imagePreview || null
      }
    };

    addToCart(customizedProduct);
    
    toast({
      title: "কাস্টমাইজড পণ্য কার্টে যোগ করা হয়েছে!",
      description: `${product.name} সফলভাবে কাস্টমাইজ করে কার্টে যোগ করা হয়েছে`,
    });
    
    onClose();
  };

  // Download customization preview
  const handleDownloadPreview = () => {
    // This would implement canvas-based preview download
    toast({
      title: "প্রিভিউ ডাউনলোড",
      description: "আপনার কাস্টমাইজেশন প্রিভিউ ডাউনলোড হচ্ছে...",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Palette className="w-6 h-6 text-orange-500" />
                পণ্য কাস্টমাইজ করুন
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{product.category}</Badge>
              <span className="text-sm text-gray-600">{product.name}</span>
              {product.is_featured && (
                <Badge className="bg-orange-500">
                  <Star className="w-3 h-3 mr-1" />
                  ফিচার্ড
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)]">
            {/* Preview Section */}
            <div className="flex-1 p-6 bg-gray-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">লাইভ প্রিভিউ</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetCustomization}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      রিসেট
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadPreview}>
                      <Download className="w-4 h-4 mr-1" />
                      ডাউনলোড
                    </Button>
                  </div>
                </div>

                {/* Product Preview with Customization */}
                <div 
                  ref={previewRef}
                  className="aspect-square relative bg-white rounded-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={product.image_url || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Custom Text Overlay */}
                  {customization.text && (
                    <div
                      className="absolute pointer-events-none select-none"
                      style={{
                        left: `${customization.position.x}%`,
                        top: `${customization.position.y}%`,
                        transform: `translate(-50%, -50%) rotate(${customization.rotation}deg)`,
                        fontSize: `${customization.fontSize}px`,
                        fontFamily: customization.fontFamily,
                        color: customization.color,
                        backgroundColor: customization.backgroundColor !== 'transparent' ? customization.backgroundColor : 'transparent',
                        padding: customization.backgroundColor !== 'transparent' ? '4px 8px' : '0',
                        borderRadius: customization.backgroundColor !== 'transparent' ? '4px' : '0',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        maxWidth: '200px',
                        wordWrap: 'break-word',
                        textAlign: 'center',
                        lineHeight: '1.2'
                      }}
                    >
                      {customization.text}
                    </div>
                  )}
                  
                  {/* Custom Image Overlay */}
                  {customization.imagePreview && (
                    <div
                      className="absolute border-2 border-white shadow-lg rounded-lg overflow-hidden"
                      style={{
                        left: `${customization.position.x}%`,
                        top: `${customization.position.y}%`,
                        transform: `translate(-50%, -50%) rotate(${customization.rotation}deg)`,
                        width: '120px',
                        height: '120px',
                      }}
                    >
                      <img
                        src={customization.imagePreview}
                        alt="কাস্টম ছবি"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Position Indicator */}
                  <div
                    className="absolute w-2 h-2 bg-orange-500 rounded-full border-2 border-white shadow-lg pointer-events-none"
                    style={{
                      left: `${customization.position.x}%`,
                      top: `${customization.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>

                {/* Price Information */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">মূল দাম:</span>
                        <span className="font-semibold ml-2">{formatPrice(Number(product.price))}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">কাস্টমাইজেশন:</span>
                        <span className="font-semibold ml-2 text-orange-600">৳{customizationFee}</span>
                      </div>
                      <div className="col-span-2 border-t pt-2">
                        <span className="text-gray-600">মোট দাম:</span>
                        <span className="font-bold ml-2 text-lg text-orange-600">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Customization Controls */}
            <div className="w-full lg:w-96 border-l bg-white overflow-y-auto">
              <div className="p-6">
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="text">টেক্সট</TabsTrigger>
                    <TabsTrigger value="image">ছবি</TabsTrigger>
                    <TabsTrigger value="colors">রং</TabsTrigger>
                    <TabsTrigger value="position">অবস্থান</TabsTrigger>
                  </TabsList>
                  
                  {/* Text Customization */}
                  <TabsContent value="text" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="customText" className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        কাস্টম টেক্সট
                      </Label>
                      <Input
                        id="customText"
                        placeholder="আপনার টেক্সট লিখুন..."
                        value={customization.text || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>ফন্ট সাইজ</Label>
                        <Input
                          type="number"
                          min="10"
                          max="48"
                          value={customization.fontSize}
                          onChange={(e) => setCustomization(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>রোটেশন (ডিগ্রি)</Label>
                        <Input
                          type="number"
                          min="-180"
                          max="180"
                          value={customization.rotation}
                          onChange={(e) => setCustomization(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>ফন্ট স্টাইল</Label>
                      <select
                        className="w-full mt-1 p-2 border rounded-md"
                        value={customization.fontFamily}
                        onChange={(e) => setCustomization(prev => ({ ...prev, fontFamily: e.target.value }))}
                      >
                        {FONT_FAMILIES.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </TabsContent>
                  
                  {/* Image Upload */}
                  <TabsContent value="image" className="space-y-4 mt-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4" />
                        ছবি আপলোড করুন
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        ছবি নির্বাচন করুন
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG (সর্বোচ্চ ৫MB)
                      </p>
                    </div>
                    
                    {customization.imagePreview && (
                      <div className="mt-4">
                        <Label>আপলোডকৃত ছবি:</Label>
                        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden mt-2">
                          <img
                            src={customization.imagePreview}
                            alt="আপলোডকৃত ছবি"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCustomization(prev => ({ 
                            ...prev, 
                            uploadedImage: null, 
                            imagePreview: undefined 
                          }))}
                          className="text-red-500 mt-2"
                        >
                          <X className="w-4 h-4 mr-1" />
                          ছবি সরান
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Color Selection */}
                  <TabsContent value="colors" className="space-y-4 mt-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        <Paintbrush className="w-4 h-4" />
                        রং নির্বাচন করুন
                      </Label>
                      <div className="grid grid-cols-5 gap-2">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color.value}
                            className={`w-12 h-12 rounded-lg border-2 transition-all ${
                              customization.color === color.value 
                                ? 'border-orange-500 scale-110' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => handleColorSelect(color)}
                            title={color.name}
                          />
                        ))}
                      </div>
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">নির্বাচিত রং: </span>
                        <span className="font-medium">{customization.colorName}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label>ব্যাকগ্রাউন্ড রং</Label>
                      <Input
                        type="color"
                        value={customization.backgroundColor === 'transparent' ? '#FFFFFF' : customization.backgroundColor}
                        onChange={(e) => setCustomization(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="mt-1 h-12"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCustomization(prev => ({ ...prev, backgroundColor: 'transparent' }))}
                        className="mt-1 text-sm"
                      >
                        স্বচ্ছ করুন
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Position Controls */}
                  <TabsContent value="position" className="space-y-4 mt-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        <Move className="w-4 h-4" />
                        অবস্থান নিয়ন্ত্রণ
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">X অবস্থান (%)</Label>
                          <Input
                            type="number"
                            min="5"
                            max="95"
                            value={Math.round(customization.position.x)}
                            onChange={(e) => setCustomization(prev => ({
                              ...prev,
                              position: { ...prev.position, x: Number(e.target.value) }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Y অবস্থান (%)</Label>
                          <Input
                            type="number"
                            min="5"
                            max="95"
                            value={Math.round(customization.position.y)}
                            onChange={(e) => setCustomization(prev => ({
                              ...prev,
                              position: { ...prev.position, y: Number(e.target.value) }
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 প্রিভিউ এলাকায় ক্লিক করে সরাসরি অবস্থান পরিবর্তন করুন
                      </p>
                    </div>
                    
                    <div>
                      <Label>বিশেষ নির্দেশনা</Label>
                      <Textarea
                        placeholder="আপনার বিশেষ নির্দেশনা লিখুন..."
                        value={customization.instructions || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, instructions: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-3 mt-6 pt-6 border-t">
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    কার্টে যোগ করুন ({formatPrice(totalPrice)})
                  </Button>
                  
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setIsOrderNowOpen(true)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    এখনই অর্ডার করুন
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Now Modal */}
      <OrderNowModal
        isOpen={isOrderNowOpen}
        onClose={() => setIsOrderNowOpen(false)}
        product={product}
        customization={customization}
      />
    </>
  );
}