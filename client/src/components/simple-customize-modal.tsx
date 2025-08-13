import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";
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
}

const sizeOptions = [
  { value: 'm', label: 'মাঝারি (M)', price: 0 },
  { value: 'l', label: 'বড় (L)', price: 100 },
  { value: 'xl', label: 'অতি বড় (XL)', price: 200 },
];

const colorOptions = [
  { name: 'কালো', value: '#000000' },
  { name: 'সাদা', value: '#FFFFFF' },
  { name: 'লাল', value: '#EF4444' },
  { name: 'নীল', value: '#3B82F6' },
  { name: 'সবুজ', value: '#10B981' },
];

export default function SimpleCustomizeModal({ product, isOpen, onClose }: SimpleCustomizeModalProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();

  const [customization, setCustomization] = useState<SimpleCustomization>({
    size: 'm',
    color: '#000000',
    text: '',
    quantity: 1,
    notes: ''
  });

  if (!product) return null;

  const basePrice = Number(product.price) || 0;
  const sizePrice = sizeOptions.find(s => s.value === customization.size)?.price || 0;
  const textPrice = customization.text.trim() ? 100 : 0;
  const totalPrice = (basePrice + sizePrice + textPrice) * customization.quantity;

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}_custom_${Date.now()}`,
      name: `${product.name} (কাস্টমাইজড)`,
      price: totalPrice,
      quantity: customization.quantity,
      image_url: product.image_url || undefined,
      customization
    });

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `কাস্টমাইজড ${product.name} কার্টে যোগ করা হয়েছে`,
      duration: 3000,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {product.name} কাস্টমাইজ করুন
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <div className="text-center">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-lg font-bold text-green-600 mt-2">
                মোট: {formatPrice(totalPrice)}
              </p>
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">সাইজ নির্বাচন করুন</Label>
            <Select 
              value={customization.size} 
              onValueChange={(value) => setCustomization(prev => ({ ...prev, size: value }))}
            >
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
            <Label className="text-base font-medium">রং নির্বাচন করুন</Label>
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
                />
              ))}
            </div>
          </div>

          {/* Custom Text */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              কাস্টম টেক্সট (+১০০ টাকা)
            </Label>
            <Input
              placeholder="আপনার পছন্দের টেক্সট লিখুন..."
              value={customization.text}
              onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
              maxLength={50}
            />
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

          {/* Notes */}
          <div className="space-y-3">
            <Label className="text-base font-medium">বিশেষ নির্দেশনা</Label>
            <Textarea
              placeholder="কোনো বিশেষ নির্দেশনা থাকলে এখানে লিখুন..."
              value={customization.notes}
              onChange={(e) => setCustomization(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              বাতিল
            </Button>
            <Button onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="w-4 h-4 mr-2" />
              কার্টে যোগ করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}