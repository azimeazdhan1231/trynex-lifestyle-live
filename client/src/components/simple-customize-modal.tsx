
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, ShoppingCart, Plus, Minus, Palette, Shirt, Type, CheckCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface SimpleCustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SimpleCustomization {
  size: string;
  color: string;
  text: string;
  quantity: number;
  notes: string;
  material: string;
  engraving: string;
}

const sizeOptions = [
  { value: 'xs', label: 'অতি ছোট (XS)', price: 0, description: '৮-১০ ইঞ্চি' },
  { value: 's', label: 'ছোট (S)', price: 0, description: '১০-১২ ইঞ্চি' },
  { value: 'm', label: 'মাঝারি (M)', price: 50, description: '১২-১৪ ইঞ্চি' },
  { value: 'l', label: 'বড় (L)', price: 100, description: '১৪-১৬ ইঞ্চি' },
  { value: 'xl', label: 'অতি বড় (XL)', price: 150, description: '১৬-১৮ ইঞ্চি' },
  { value: 'xxl', label: 'দ্বিগুণ বড় (XXL)', price: 200, description: '১৮-২০ ইঞ্চি' },
];

const colorOptions = [
  { name: 'কালো', value: '#000000', hex: '#000000' },
  { name: 'সাদা', value: '#FFFFFF', hex: '#FFFFFF' },
  { name: 'লাল', value: '#EF4444', hex: '#EF4444' },
  { name: 'নীল', value: '#3B82F6', hex: '#3B82F6' },
  { name: 'সবুজ', value: '#10B981', hex: '#10B981' },
  { name: 'গোলাপি', value: '#EC4899', hex: '#EC4899' },
  { name: 'হলুদ', value: '#F59E0B', hex: '#F59E0B' },
  { name: 'বেগুনি', value: '#8B5CF6', hex: '#8B5CF6' },
];

const materialOptions = [
  { value: 'cotton', label: 'তুলা', price: 0, quality: '★★★☆☆' },
  { value: 'premium-cotton', label: 'প্রিমিয়াম তুলা', price: 150, quality: '★★★★☆' },
  { value: 'silk', label: 'রেশম', price: 300, quality: '★★★★★' },
  { value: 'polyester', label: 'পলিয়েস্টার', price: 80, quality: '★★★☆☆' },
  { value: 'premium', label: 'প্রিমিয়াম মিক্স', price: 250, quality: '★★★★★' },
];

export default function SimpleCustomizeModal({ product, isOpen, onClose }: SimpleCustomizeModalProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const [customization, setCustomization] = useState<SimpleCustomization>({
    size: 'm',
    color: '#000000',
    text: '',
    quantity: 1,
    notes: '',
    material: 'cotton',
    engraving: ''
  });

  // Reset customization when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCustomization({
        size: 'm',
        color: '#000000',
        text: '',
        quantity: 1,
        notes: '',
        material: 'cotton',
        engraving: ''
      });
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  if (!product) return null;

  const basePrice = Number(product.price) || 0;
  const sizePrice = sizeOptions.find(s => s.value === customization.size)?.price || 0;
  const materialPrice = materialOptions.find(m => m.value === customization.material)?.price || 0;
  const textPrice = customization.text.trim() ? 120 : 0;
  const engravingPrice = customization.engraving.trim() ? 200 : 0;
  
  const subtotal = basePrice + sizePrice + materialPrice + textPrice + engravingPrice;
  const totalPrice = subtotal * customization.quantity;

  const handleAddToCart = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      addToCart({
        id: `${product.id}_custom_${Date.now()}`,
        name: `${product.name} (কাস্টমাইজড)`,
        price: totalPrice,
        quantity: customization.quantity,
        image_url: product.image_url || undefined,
        customization: {
          ...customization,
          selectedColorName: colorOptions.find(c => c.value === customization.color)?.name,
          selectedSizeName: sizeOptions.find(s => s.value === customization.size)?.label,
          selectedMaterialName: materialOptions.find(m => m.value === customization.material)?.label,
        }
      });

      toast({
        title: "সফলভাবে কার্টে যোগ করা হয়েছে! ✓",
        description: `কাস্টমাইজড ${product.name} (${formatPrice(totalPrice)}) কার্টে যোগ করা হয়েছে`,
        duration: 4000,
      });

      onClose();
    } catch (error) {
      toast({
        title: "কিছু সমস্যা হয়েছে",
        description: "অনুগ্রহ করে আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedSize = sizeOptions.find(s => s.value === customization.size);
  const selectedMaterial = materialOptions.find(m => m.value === customization.material);
  const selectedColor = colorOptions.find(c => c.value === customization.color);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="
          fixed inset-0 z-50 
          w-screen h-screen max-w-none max-h-none 
          p-0 m-0 border-0 rounded-none 
          bg-white overflow-hidden
          data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
        "
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{product.name} কাস্টমাইজ করুন</DialogTitle>
        <DialogDescription className="sr-only">
          আপনার পছন্দ অনুযায়ী পণ্যটি সাজিয়ে নিন এবং দেখুন কেমন লাগছে
        </DialogDescription>

        {/* Full Screen Layout */}
        <div className="flex flex-col h-screen overflow-hidden">
          
          {/* Header */}
          <div className="flex-shrink-0 px-4 md:px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 truncate">
                    {product.name} কাস্টমাইজ করুন
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 hidden md:block">
                    আপনার পছন্দ অনুযায়ী পণ্যটি সাজিয়ে নিন এবং দেখুন কেমন লাগছে
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge className="bg-green-500 text-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-lg font-bold">
                  মোট: {formatPrice(totalPrice)}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose} 
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col lg:flex-row">
              
              {/* Product Preview Section - Left/Top */}
              <div className="w-full lg:w-1/2 bg-gray-50 p-4 md:p-6 overflow-y-auto">
                
                {/* Main Product Image with Live Preview */}
                <Card className="mb-6 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
                  <CardContent className="p-0">
                    <div className="aspect-square relative bg-white">
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Color Overlay Effect */}
                      {customization.color !== '#FFFFFF' && (
                        <div 
                          className="absolute inset-0 mix-blend-multiply opacity-25 pointer-events-none transition-all duration-300"
                          style={{ backgroundColor: customization.color }}
                        />
                      )}
                      
                      {/* Custom Text Preview */}
                      {customization.text && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-xl border-2 border-orange-200 max-w-[80%]">
                            <span 
                              className="font-bold text-lg md:text-xl lg:text-2xl text-center break-words"
                              style={{ color: customization.color === '#FFFFFF' ? '#000000' : customization.color }}
                            >
                              {customization.text}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Engraving Preview */}
                      {customization.engraving && (
                        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-sm">
                          খোদাই: {customization.engraving}
                        </div>
                      )}

                      {/* Size Indicator */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-sm font-medium">
                        {selectedSize?.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Price Summary */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                        {formatPrice(totalPrice)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {customization.quantity > 1 && `${customization.quantity}টি × ${formatPrice(subtotal)} = `}
                        সর্বমোট দাম
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customization Options - Right/Bottom */}
              <div className="w-full lg:w-1/2 p-4 md:p-6 overflow-y-auto bg-white" data-testid="customization-panel">
                <div className="space-y-6">

                  {/* Size Selection */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg mb-4 flex items-center gap-2">
                        <Shirt className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                        সাইজ নির্বাচন করুন
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {sizeOptions.map((size) => (
                          <button
                            key={size.value}
                            onClick={() => setCustomization(prev => ({ ...prev, size: size.value }))}
                            className={`p-3 md:p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                              customization.size === size.value
                                ? 'border-orange-500 bg-orange-50 shadow-md scale-[1.02]'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            data-testid={`size-option-${size.value}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-sm md:text-base">{size.label}</span>
                              {customization.size === size.value && (
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600 mb-1">{size.description}</div>
                            {size.price > 0 && (
                              <div className="text-xs md:text-sm font-medium text-green-600">
                                +{formatPrice(size.price)}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Color Selection */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg mb-4 flex items-center gap-2">
                        <Palette className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                        রং নির্বাচন করুন
                      </h3>
                      
                      <div className="grid grid-cols-4 md:grid-cols-4 xl:grid-cols-4 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setCustomization(prev => ({ ...prev, color: color.value }))}
                            className={`relative p-2 md:p-3 rounded-lg border-2 transition-all duration-200 ${
                              customization.color === color.value
                                ? 'border-orange-500 ring-2 ring-orange-200 shadow-lg scale-[1.05]'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                            data-testid={`color-option-${color.value}`}
                          >
                            <div 
                              className="w-full aspect-square rounded-md mb-2 border border-gray-200"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="text-xs md:text-sm font-medium text-center leading-tight">{color.name}</div>
                            {customization.color === color.value && (
                              <div className="absolute -top-1 -right-1 md:top-1 md:right-1">
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500 bg-white rounded-full shadow-sm" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Material Selection */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                        উপাদান নির্বাচন করুন
                      </h3>
                      
                      <div className="space-y-3">
                        {materialOptions.map((material) => (
                          <button
                            key={material.value}
                            onClick={() => setCustomization(prev => ({ ...prev, material: material.value }))}
                            className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                              customization.material === material.value
                                ? 'border-orange-500 bg-orange-50 shadow-md scale-[1.01]'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            data-testid={`material-option-${material.value}`}
                          >
                            <div className="flex justify-between items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm md:text-base">{material.label}</div>
                                <div className="text-xs md:text-sm text-gray-600">গুণমান: {material.quality}</div>
                              </div>
                              <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                                {material.price > 0 && (
                                  <div className="font-medium text-green-600 text-sm">+{formatPrice(material.price)}</div>
                                )}
                                {customization.material === material.value && (
                                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Text Customization */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg mb-4 flex items-center gap-2">
                        <Type className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                        টেক্সট কাস্টমাইজেশন
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm md:text-base font-medium mb-2 block">
                            কাস্টম টেক্সট (+১২০ টাকা)
                          </Label>
                          <Input
                            placeholder="আপনার পছন্দের টেক্সট লিখুন..."
                            value={customization.text}
                            onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                            maxLength={50}
                            className="text-base h-10 md:h-12"
                            data-testid="custom-text-input"
                          />
                          <div className="text-xs md:text-sm text-gray-500 mt-1">
                            {customization.text.length}/50 অক্ষর
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm md:text-base font-medium mb-2 block">
                            খোদাই (+২০০ টাকা)
                          </Label>
                          <Input
                            placeholder="খোদাই করার জন্য টেক্সট..."
                            value={customization.engraving}
                            onChange={(e) => setCustomization(prev => ({ ...prev, engraving: e.target.value }))}
                            maxLength={30}
                            className="h-10 md:h-12"
                            data-testid="engraving-input"
                          />
                          <div className="text-xs md:text-sm text-gray-500 mt-1">
                            {customization.engraving.length}/30 অক্ষর
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quantity & Notes */}
                  <Card className="shadow-sm">
                    <CardContent className="p-4 md:p-6 space-y-6">
                      <div>
                        <Label className="text-sm md:text-base font-medium mb-3 block">পরিমাণ</Label>
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setCustomization(prev => ({ 
                              ...prev, 
                              quantity: Math.max(1, prev.quantity - 1) 
                            }))}
                            disabled={customization.quantity <= 1}
                            className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                            data-testid="quantity-decrease"
                          >
                            <Minus className="w-4 h-4 md:w-5 md:h-5" />
                          </Button>
                          
                          <div className="bg-gray-50 px-4 py-2 md:px-6 md:py-3 rounded-lg min-w-[60px] md:min-w-[80px]">
                            <span className="font-bold text-xl md:text-2xl text-center block">
                              {customization.quantity}
                            </span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setCustomization(prev => ({ 
                              ...prev, 
                              quantity: prev.quantity + 1 
                            }))}
                            className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                            data-testid="quantity-increase"
                          >
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm md:text-base font-medium mb-2 block">বিশেষ নির্দেশনা</Label>
                        <Textarea
                          placeholder="কোনো বিশেষ নির্দেশনা থাকলে এখানে লিখুন..."
                          value={customization.notes}
                          onChange={(e) => setCustomization(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="resize-none text-sm md:text-base"
                          maxLength={200}
                          data-testid="special-notes"
                        />
                        <div className="text-xs md:text-sm text-gray-500 mt-1">
                          {customization.notes.length}/200 অক্ষর
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer with Actions */}
          <div className="flex-shrink-0 px-4 md:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Total Price - Always visible */}
              <div className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {formatPrice(totalPrice)}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  {customization.quantity > 1 && `${customization.quantity}টি × ${formatPrice(subtotal)} = `}
                  সর্বমোট দাম
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex-1 md:flex-initial min-w-[100px] md:min-w-[120px] h-10 md:h-12 text-sm md:text-base"
                  disabled={isProcessing}
                >
                  বাতিল
                </Button>
                
                <Button 
                  onClick={handleAddToCart} 
                  className="flex-1 md:flex-initial bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white min-w-[140px] md:min-w-[200px] h-10 md:h-12 text-sm md:text-lg font-semibold shadow-lg"
                  disabled={isProcessing}
                  data-testid="add-to-cart-final"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden md:inline">প্রসেসিং...</span>
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                      <span className="hidden md:inline">কার্টে যোগ করুন</span>
                      <span className="md:hidden">কার্ট</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
