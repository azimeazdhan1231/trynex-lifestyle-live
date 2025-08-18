import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { CartWithCheckout } from "./simple-cart-modal";
import { cn } from "@/lib/utils";

interface IntegratedCartSystemProps {
  className?: string;
}



export default function IntegratedCartSystem({ className = "" }: IntegratedCartSystemProps) {
  const { getTotalItems } = useCart();
  const { toast } = useToast();
  
  const [isCartOpen, setIsCartOpen] = useState(false);

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
    // Close cart modal - checkout will be handled by the cart modal itself
    setIsCartOpen(false);
  }, [hasItems, toast]);

  return (
    <div className={cn("relative", className)}>
      {/* Cart Button - Floating or Inline */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenCart}
        className={cn(
          "relative bg-white hover:bg-gray-50 border-gray-200 transition-all duration-200 text-gray-700 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-600",
          hasItems && "ring-2 ring-orange-200 border-orange-300 text-orange-600 dark:text-orange-400"
        )}
        data-testid="cart-button"
      >
        <ShoppingCart className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-200" />
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

      {/* Cart with Checkout */}
      <CartWithCheckout
        isOpen={isCartOpen}
        onClose={handleCloseCart}
      />


    </div>
  );
}