import { useLocation } from "wouter";
import { useState } from "react";
import Header from "@/components/header";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header 
        cartCount={cart.length}
        onCartOpen={handleCartOpen}
      />
      <ImprovedCustomOrderForm />
      
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderComplete={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}