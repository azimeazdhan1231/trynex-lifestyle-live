import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Gift, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import type { Offer } from "@shared/schema";

export default function PopupOffer() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { totalPrice, cart } = useCart();

  // Load popup offers
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  // Check if cart total is 1500+ and show free delivery popup
  const shouldShowFreeDelivery = totalPrice >= 1500 && cart.length > 0;
  const freeDeliveryOffer = offers.find(offer => 
    offer.active && 
    offer.is_popup && 
    offer.title?.includes('ফ্রি ডেলিভারি')
  );
  
  const popupOffer = offers.find(offer => offer.active && offer.is_popup);

  useEffect(() => {
    // Show free delivery popup when cart reaches 1500+
    if (shouldShowFreeDelivery && !hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
    // Show regular popup offers
    else if (popupOffer && !hasShown && !shouldShowFreeDelivery) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, popupOffer.popup_delay || 3000);

      return () => clearTimeout(timer);
    }
  }, [popupOffer, hasShown, shouldShowFreeDelivery]);

  // Show free delivery popup if cart is 1500+ or regular offer popup
  const currentOffer = shouldShowFreeDelivery ? {
    title: "🎉 ফ্রি ডেলিভারি আনলক!",
    description: `আপনার অর্ডার ৳${totalPrice.toFixed(0)} - ফ্রি ডেলিভারি পেয়ে গেছেন!`,
    is_popup: true,
    active: true
  } : popupOffer;

  if (!currentOffer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="absolute right-2 top-2 text-white hover:bg-white/20 z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            {shouldShowFreeDelivery ? 
              <Truck className="w-16 h-16 text-yellow-300 animate-bounce" /> :
              <Gift className="w-16 h-16 text-yellow-300 animate-bounce" />
            }
          </div>
          
          <h3 className="text-2xl font-bold mb-2">{currentOffer.title}</h3>
          
          {currentOffer.description && (
            <p className="text-lg mb-4 text-emerald-100">{currentOffer.description}</p>
          )}

          {shouldShowFreeDelivery ? (
            <div className="bg-yellow-400 text-gray-900 rounded-full px-4 py-2 font-bold text-xl mb-4 inline-block">
              ফ্রি ডেলিভারি!
            </div>
          ) : (
            <>
              {'discount_percentage' in currentOffer && currentOffer.discount_percentage && currentOffer.discount_percentage > 0 && (
                <div className="bg-yellow-400 text-gray-900 rounded-full px-4 py-2 font-bold text-xl mb-4 inline-block">
                  {currentOffer.discount_percentage}% ছাড়!
                </div>
              )}

              {'min_order_amount' in currentOffer && currentOffer.min_order_amount && Number(currentOffer.min_order_amount) > 0 && (
                <p className="text-sm text-emerald-200 mb-4">
                  ন্যূনতম অর্ডার: ৳{currentOffer.min_order_amount}
                </p>
              )}

              {'expiry' in currentOffer && currentOffer.expiry && (
                <p className="text-sm text-emerald-200 mb-6">
                  মেয়াদ: {new Date(currentOffer.expiry).toLocaleDateString('bn-BD')}
                </p>
              )}
            </>
          )}

          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 font-bold text-lg px-8 py-3 w-full"
          >
            <Link href={('button_link' in currentOffer && currentOffer.button_link) || "/products"}>
              {('button_text' in currentOffer && currentOffer.button_text) || "অর্ডার করুন"}
            </Link>
          </Button>
        </div>

        {'image_url' in currentOffer && currentOffer.image_url && (
          <div className="h-32 bg-white/10 flex items-center justify-center">
            <img
              src={currentOffer.image_url}
              alt={currentOffer.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}