import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  ShoppingBag,
  Package2,
  CreditCard,
  ArrowRight
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import CheckoutModal from "./checkout-modal";

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
  const [showCheckout, setShowCheckout] = useState(false);

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
    console.log('🛒 Checkout button clicked!', { hasOnCheckout: !!onCheckout, showCheckout });
    if (items.length === 0) {
      toast({
        title: "কার্ট খালি",
        description: "প্রথমে কিছু পণ্য কার্টে যোগ করুন",
        variant: "destructive",
      });
      return;
    }
    
    if (onCheckout) {
      onCheckout();
    } else {
      setShowCheckout(true);
      console.log('🛒 Opening checkout modal');
    }
  };

  const handleOrderComplete = (orderId: string) => {
    setShowCheckout(false);
    onClose();
    toast({
      title: 'অর্ডার সফল! 🎉',
      description: `অর্ডার নম্বর: ${orderId}. শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।`,
    });
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
      <DialogContent className="p-0 gap-0 border-0 shadow-2xl overflow-hidden w-screen h-screen max-w-none max-h-none rounded-none fixed inset-0 z-50 flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between p-8 border-b-2 bg-gradient-to-r from-orange-50 to-red-50 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold text-gray-900">আপনার কার্ট</DialogTitle>
              <DialogDescription className="text-xl text-gray-600">{totalItems} টি পণ্য নির্বাচিত</DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            className="rounded-full h-14 w-14 p-0 hover:bg-white/50"
            data-testid="button-close-cart"
          >
            <X className="h-7 w-7" />
          </Button>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 h-full">
          {/* Cart Items - Left Side (Takes 70% of screen) */}
          <div className="flex-1 bg-gray-50 p-8 overflow-hidden">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">নির্বাচিত পণ্যসমূহ</h2>
              {items.length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                  data-testid="clear-cart"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  সব সরান
                </Button>
              )}
            </div>

            <ScrollArea className="h-[calc(100vh-200px)] pr-6">
              <div className="space-y-8">
                {items.map((item) => (
                  <div 
                    key={`${item.id}-${JSON.stringify(item.customization)}`}
                    className="bg-white rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 p-8"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="flex gap-8">
                      {/* Product Image */}
                      <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border-2 flex-shrink-0">
                        <img
                          src={item.image_url || item.image || '/placeholder-product.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.png';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-xl mb-3 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="font-bold text-orange-600 text-xl mb-6">
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
                        <div className="flex items-center gap-6 mb-6">
                          <span className="text-lg font-semibold text-gray-700">পরিমাণ:</span>
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="h-12 w-12 p-0 rounded-full border-2"
                              data-testid={`decrease-quantity-${item.id}`}
                            >
                              <Minus className="h-6 w-6" />
                            </Button>
                            <Badge variant="secondary" className="px-6 py-2 text-xl min-w-[60px] justify-center">
                              {item.quantity}
                            </Badge>
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="h-12 w-12 p-0 rounded-full border-2"
                              data-testid={`increase-quantity-${item.id}`}
                            >
                              <Plus className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>

                        {/* Subtotal & Remove */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg text-gray-600">সাবটোটাল: </span>
                            <span className="font-bold text-gray-900 text-xl">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-12 px-6"
                            data-testid={`remove-item-${item.id}`}
                          >
                            <Trash2 className="h-5 w-5 mr-2" />
                            সরান
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Order Summary - Right Side (Takes 30% of screen) */}
          <div className="w-[480px] bg-white border-l-2 flex flex-col">
            <div className="p-8 border-b-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">অর্ডার সারসংক্ষেপ</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between text-xl">
                  <span className="text-gray-600">সাবটোটাল:</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between text-xl">
                  <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                  <span className={cn(
                    "font-bold",
                    deliveryFee === 0 ? "text-green-600" : "text-gray-900"
                  )}>
                    {deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}
                  </span>
                </div>
                
                {deliveryFee === 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-green-700 font-bold text-lg">
                      🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন
                    </p>
                  </div>
                )}
                
                {deliveryFee > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700 text-lg">
                      আরও {formatPrice(1600 - total)} কিনলে ফ্রি ডেলিভারি পাবেন!
                    </p>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <div className="flex justify-between text-2xl font-bold">
                  <span>মোট:</span>
                  <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-1 flex flex-col justify-end p-8 space-y-6">
              <Button
                onClick={handleCheckout}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold text-xl h-16"
                data-testid="checkout-button"
              >
                চেকআউট করুন
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={onClose}
                className="w-full text-xl h-14 border-2"
                data-testid="continue-shopping"
              >
                কেনাকাটা চালিয়ে যান
              </Button>

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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Separate component to handle both cart and checkout modals
export function CartWithCheckout({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const { toast } = useToast();

  const handleCheckout = () => {
    console.log('🛒 Opening checkout from cart', { showCheckout });
    setShowCheckout(true);
    console.log('🛒 Checkout state updated to:', true);
  };

  const handleOrderComplete = (orderId: string) => {
    setShowCheckout(false);
    onClose();
    toast({
      title: 'অর্ডার সফল! 🎉',
      description: `অর্ডার নম্বর: ${orderId}. শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।`,
    });
  };

  console.log('🛒 CartWithCheckout render:', { isOpen, showCheckout });

  return (
    <>
      <SimpleCartModal
        isOpen={isOpen}
        onClose={onClose}
        onCheckout={handleCheckout}
      />
      
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => {
          console.log('🛒 Closing checkout modal');
          setShowCheckout(false);
        }}
        onOrderComplete={handleOrderComplete}
      />
    </>
  );
}