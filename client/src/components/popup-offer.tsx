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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl p-6 m-4 max-w-sm w-full shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors z-10"
          data-testid="button-close-popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Offer Content */}
        <div className="text-center">
          <div className="mb-4">
            <Gift className="w-12 h-12 mx-auto text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            {activePopupOffer.title}
          </h2>
          
          <p className="text-gray-600 mb-6 text-sm">
            {activePopupOffer.description}
          </p>
          
          <div className="space-y-3">
            <Link href="/products">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                onClick={() => setIsOpen(false)}
                data-testid="button-accept-offer"
              >
                অফার নিন
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full text-gray-600 hover:bg-gray-50"
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