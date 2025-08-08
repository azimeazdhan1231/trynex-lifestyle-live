import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Offer } from "@shared/schema";

export default function PopupOffer() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Load popup offers
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  const activePopupOffer = offers.find(offer => offer.active && offer.is_popup);

  useEffect(() => {
    if (activePopupOffer && !hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, activePopupOffer.popup_delay || 3000);

      return () => clearTimeout(timer);
    }
  }, [activePopupOffer, hasShown]);

  if (!activePopupOffer || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-3 -right-3 w-9 h-9 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-all duration-200 shadow-lg hover:scale-110"
          data-testid="button-close-popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Offer Content */}
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
            🎉 {activePopupOffer.title}
          </h2>
          
          <p className="text-gray-600 mb-8 text-base leading-relaxed">
            {activePopupOffer.description}
          </p>
          
          <div className="space-y-4">
            <Link href="/products">
              <Button 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsOpen(false)}
                data-testid="button-accept-offer"
              >
                অফার নিন
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full h-10 text-gray-600 hover:bg-gray-50 border-gray-300 rounded-xl"
              onClick={() => setIsOpen(false)}
              data-testid="button-dismiss-offer"
            >
              পরে দেখব
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}