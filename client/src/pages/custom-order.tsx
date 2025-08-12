import { useState } from "react";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import ImprovedCustomOrderForm from "@/components/ImprovedCustomOrderForm";
import CheckoutModal from "@/components/checkout-modal";
import { useCart } from "@/hooks/use-cart";

export default function CustomOrderPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cart } = useCart();

  const handleCartOpen = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <ImprovedCustomOrderForm />
        
        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          onOrderComplete={() => setIsCheckoutOpen(false)}
        />
      </div>
    </MobileOptimizedLayout>
  );
}