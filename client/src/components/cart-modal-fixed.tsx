import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import { ShoppingCart, Plus, Minus, Trash2, X, Package } from "lucide-react";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModalFixed({ isOpen, onClose }: CartModalProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  console.log('CartModal cart state:', { cart, totalItems, totalPrice });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast({
      title: "পণ্য সরানো হয়েছে",
      description: "পণ্যটি কার্ট থেকে সরানো হয়েছে",
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "কার্ট খালি করা হয়েছে",
      description: "সব পণ্য কার্ট থেকে সরানো হয়েছে",
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "কার্ট খালি",
        description: "চেকআউট করার জন্য কার্টে পণ্য যোগ করুন",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    
    // Simulate checkout process
    setTimeout(() => {
      setIsCheckingOut(false);
      toast({
        title: "চেকআউট সফল!",
        description: "আপনার অর্ডার প্রক্রিয়াকরণ করা হবে",
      });
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            কার্ট ({totalItems} টি পণ্য)
          </DialogTitle>
          <DialogDescription>
            আপনার নির্বাচিত পণ্যসমূহ পর্যালোচনা করুন
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">আপনার কার্ট খালি</h3>
              <p className="text-gray-500 mb-4">শপিং শুরু করতে পণ্য যোগ করুন</p>
              <Button onClick={onClose} variant="outline">
                শপিং করুন
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <Card key={item.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1 line-clamp-2">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-green-600 font-bold">
                                {formatPrice(item.price)}
                              </span>
                              {item.customization && (
                                <Badge variant="secondary" className="text-xs">
                                  কাস্টম
                                </Badge>
                              )}
                            </div>
                            
                            {item.customization && (
                              <div className="text-xs text-gray-600 mb-2">
                                {item.customization.size && (
                                  <span className="mr-2">সাইজ: {item.customization.size}</span>
                                )}
                                {item.customization.color && (
                                  <span>রং: {item.customization.color}</span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="h-7 w-7 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="h-7 w-7 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-green-600 mb-2">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">মোট পণ্য:</span>
                  <span className="font-medium">{totalItems} টি</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>মোট দাম:</span>
                  <span className="text-green-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="flex-1"
                  disabled={cart.length === 0}
                >
                  কার্ট খালি করুন
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cart.length === 0}
                  className="flex-1"
                >
                  {isCheckingOut ? "প্রক্রিয়াকরণ..." : "চেকআউট"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}