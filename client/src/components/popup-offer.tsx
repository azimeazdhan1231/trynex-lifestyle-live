
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Gift, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="modal-container">
        {/* Modal Container */}
        <div className="relative w-full max-w-sm mx-auto animate-in zoom-in-95 duration-300">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-3 -right-3 z-50 w-10 h-10 bg-white rounded-full shadow-xl border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Main Card */}
          <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-3xl shadow-2xl overflow-hidden relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-300/20 rounded-full animate-pulse"></div>
              <div className="absolute top-12 right-8 w-4 h-4 bg-white/20 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-8 left-8 w-6 h-6 bg-yellow-300/20 rounded-full animate-pulse delay-700"></div>
              <div className="absolute top-1/2 right-4 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {shouldShowFreeDelivery ? (
                    <Truck className="w-20 h-20 text-yellow-300 animate-bounce drop-shadow-lg" />
                  ) : (
                    <Gift className="w-20 h-20 text-yellow-300 animate-bounce drop-shadow-lg" />
                  )}
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-8 h-8 text-yellow-200 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white leading-tight drop-shadow-sm">
                {currentOffer.title}
              </h3>

              {/* Description */}
              {currentOffer.description && (
                <p className="text-lg sm:text-xl mb-6 text-white/95 leading-relaxed drop-shadow-sm">
                  {currentOffer.description}
                </p>
              )}

              {/* Special Badge */}
              {shouldShowFreeDelivery ? (
                <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full px-6 py-3 font-bold text-xl mb-6 shadow-lg animate-pulse">
                  ফ্রি ডেলিভারি! 🚚
                </div>
              ) : (
                <>
                  {'discount_percentage' in currentOffer && currentOffer.discount_percentage && currentOffer.discount_percentage > 0 && (
                    <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full px-6 py-3 font-bold text-xl mb-6 shadow-lg animate-pulse">
                      {currentOffer.discount_percentage}% ছাড়! 🎯
                    </div>
                  )}

                  {'min_order_amount' in currentOffer && currentOffer.min_order_amount && Number(currentOffer.min_order_amount) > 0 && (
                    <p className="text-sm text-white/90 mb-4 bg-white/10 rounded-lg px-4 py-2 inline-block">
                      ন্যূনতম অর্ডার: ৳{currentOffer.min_order_amount}
                    </p>
                  )}

                  {'expiry' in currentOffer && currentOffer.expiry && (
                    <p className="text-sm text-white/80 mb-6 bg-red-500/20 rounded-lg px-4 py-2 inline-block">
                      ⏰ মেয়াদ: {new Date(currentOffer.expiry).toLocaleDateString('bn-BD')}
                    </p>
                  )}
                </>
              )}

              {/* Action Button */}
              <Button
                asChild
                size="lg"
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border-0"
              >
                <Link href={('button_link' in currentOffer && currentOffer.button_link) || "/products"}>
                  {('button_text' in currentOffer && currentOffer.button_text) || "অর্ডার করুন"} 🛒
                </Link>
              </Button>
            </div>

            {/* Optional Image Section */}
            {'image_url' in currentOffer && currentOffer.image_url && (
              <div className="bg-white/10 backdrop-blur-sm p-6 border-t border-white/20">
                <img
                  src={currentOffer.image_url}
                  alt={currentOffer.title}
                  className="max-h-24 max-w-full object-contain mx-auto rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
