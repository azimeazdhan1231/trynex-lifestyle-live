import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  ShoppingBag,
  Package2
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface SimpleCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export default function SimpleCartModal({ 
  isOpen, 
  onClose, 
  onCheckout 
}: SimpleCartModalProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCart();
  const { toast } = useToast();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const total = getTotalPrice();
  const totalItems = getTotalItems();
  const deliveryFee = total >= 1600 ? 0 : 120;
  const grandTotal = total + deliveryFee;

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast({
      title: "পণ্য সরানো হয়েছে",
      description: "পণ্যটি কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
    toast({
      title: "কার্ট খালি করা হয়েছে",
      description: "সব পণ্য কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  const createWhatsAppUrl = () => {
    const phoneNumber = "8801765555593";
    const itemsText = items.map(item => 
      `${item.name} - ৳${item.price} × ${item.quantity} = ৳${item.price * item.quantity}`
    ).join('\n');

    const message = `আসসালামু আলাইকুম! আমি অর্ডার দিতে চাই।

📦 পণ্যসমূহ:
${itemsText}

💰 সাবটোটাল: ৳${total}
🚚 ডেলিভারি: ৳${deliveryFee}
💳 মোট: ৳${grandTotal}

দয়া করে অর্ডার কনফার্ম করুন।`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      // Default WhatsApp checkout
      window.open(createWhatsAppUrl(), '_blank');
    }
  };

  console.log('🛒 SimpleCartModal rendered with:', { items, totalItems, total, isOpen });

  // Empty cart state
  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-gray-500" />
              কার্ট খালি
            </DialogTitle>
            <DialogDescription>
              আপনার কার্টে কোন পণ্য নেই
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8">
            <Package2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              আপনার কার্ট খালি
            </h3>
            <p className="text-gray-600 mb-6">
              কেনাকাটা শুরু করতে পণ্য যোগ করুন
            </p>
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              কেনাকাটা শুরু করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">আপনার কার্ট</h2>
                <p className="text-sm text-gray-600">{totalItems} টি পণ্য নির্বাচিত</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              data-testid="button-close-cart"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="sr-only">
            আপনার কার্টে {totalItems} টি পণ্য আছে
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <Card key={`${item.id}-${JSON.stringify(item.customization)}`} className="border border-gray-200 rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url || item.image || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.png';
                        }}
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-lg font-bold text-orange-600 mb-2">
                        {formatPrice(item.price)} / টি
                      </p>
                      
                      {/* Customization Display */}
                      {item.customization && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Badge variant="outline" className="bg-white text-blue-800 border-blue-300 text-xs font-medium mb-2">
                            কাস্টমাইজড
                          </Badge>
                          <div className="text-xs text-blue-700 space-y-1">
                            {item.customization.text && (
                              <p><strong>টেক্সট:</strong> "{item.customization.text}"</p>
                            )}
                            {item.customization.color && (
                              <p><strong>রং:</strong> {item.customization.color}</p>
                            )}
                            {item.customization.size && (
                              <p><strong>সাইজ:</strong> {item.customization.size}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            মোট: {formatPrice(item.price * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary and Actions */}
        <div className="border-t pt-4 mt-auto">
          {/* Price Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>সাবটোটাল ({totalItems} টি পণ্য)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ডেলিভারি চার্জ</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                  {deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}
                </span>
              </div>
              {total < 1600 && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  আরো {formatPrice(1600 - total)} কিনলে ফ্রি ডেলিভারি পাবেন!
                </p>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>মোট</span>
                <span className="text-orange-600">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              আরো কেনাকাটা
            </Button>

            <Button
              onClick={() => setShowClearConfirm(true)}
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              কার্ট খালি করুন
            </Button>

            <Button
              onClick={handleCheckout}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              অর্ডার করুন
            </Button>
          </div>

          {/* Clear Cart Confirmation */}
          {showClearConfirm && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 mb-3 font-medium">
                আপনি কি সত্যিই সব পণ্য কার্ট থেকে সরাতে চান?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleClearCart}
                  variant="destructive"
                  size="sm"
                >
                  হ্যাঁ, খালি করুন
                </Button>
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  size="sm"
                >
                  না
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}