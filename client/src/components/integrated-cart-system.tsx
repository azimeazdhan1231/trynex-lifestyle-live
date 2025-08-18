import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import UltraResponsiveCartModal from "./ultra-responsive-cart-modal";
import UltraResponsiveCheckoutModal from "./ultra-responsive-checkout-modal";
import { cn } from "@/lib/utils";

interface IntegratedCartSystemProps {
  className?: string;
}

interface OrderDetails {
  trackingId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalPrice: number;
  paymentMethod: string;
  items: any[];
}

export default function IntegratedCartSystem({ className = "" }: IntegratedCartSystemProps) {
  const { items, getTotalItems, getTotalPrice } = useCart();
  const { toast } = useToast();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState<OrderDetails | null>(null);

  const totalItems = getTotalItems();
  const hasItems = totalItems > 0;

  const handleOpenCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const handleProceedToCheckout = useCallback(() => {
    if (!hasItems) {
      toast({
        title: "কার্ট খালি",
        description: "প্রথমে পণ্য যোগ করুন",
        variant: "destructive",
      });
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, [hasItems, toast]);

  const handleCloseCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  const handleOrderComplete = useCallback((trackingId: string) => {
    const orderDetails: OrderDetails = {
      trackingId,
      customerName: "Customer", // Will be filled from form
      customerPhone: "01xxxxxxxxx", // Will be filled from form
      customerAddress: "Address", // Will be filled from form
      totalPrice: getTotalPrice(),
      paymentMethod: "Mixed Payment",
      items: [...items]
    };
    
    setOrderComplete(orderDetails);
    setIsCheckoutOpen(false);
    
    // Show success notification
    toast({
      title: "অর্ডার সফল! 🎉",
      description: `আপনার অর্ডার নম্বর: ${trackingId}`,
    });

    // Reset order complete after 5 seconds
    setTimeout(() => {
      setOrderComplete(null);
    }, 5000);
  }, [items, getTotalPrice, toast]);

  return (
    <div className={cn("relative", className)}>
      {/* Cart Button - Floating or Inline */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenCart}
        className={cn(
          "relative bg-white hover:bg-gray-50 border-gray-200 transition-all duration-200",
          hasItems && "ring-2 ring-orange-200 border-orange-300"
        )}
        data-testid="cart-button"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">কার্ট</span>
        
        {/* Item Count Badge */}
        {hasItems && (
          <Badge 
            variant="default"
            className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full animate-pulse"
          >
            {totalItems > 99 ? "99+" : totalItems}
          </Badge>
        )}
      </Button>

      {/* Ultra Responsive Cart Modal */}
      <UltraResponsiveCartModal
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        onCheckout={handleProceedToCheckout}
      />

      {/* Ultra Responsive Checkout Modal */}
      <UltraResponsiveCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        onOrderComplete={handleOrderComplete}
      />

      {/* Order Success Notification */}
      {orderComplete && (
        <div className="fixed top-4 right-4 z-[9999] bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm animate-in slide-in-from-top-2 duration-500">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">অর্ডার সফল!</h4>
              <p className="text-sm text-green-700 mb-2">
                অর্ডার নম্বর: <span className="font-mono font-bold">{orderComplete.trackingId}</span>
              </p>
              <p className="text-xs text-green-600">
                শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}