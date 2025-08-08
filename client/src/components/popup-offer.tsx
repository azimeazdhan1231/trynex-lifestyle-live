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
    <div 
      className="fixed z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="relative bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 transform-gpu"
        style={{ 
          position: 'relative', 
          zIndex: 10000,
          maxHeight: '90vh',
          overflow: 'auto',
          margin: 'auto'
        }}
      >
        {/* Close Button - Fixed positioning and z-index */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-3 -right-3 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-all duration-200 shadow-lg hover:scale-110 border-2 border-white"
          style={{ 
            zIndex: 10001,
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          data-testid="button-close-popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Offer Content */}
        <div className="text-center">
          <div className="mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight px-2">
            🎉 {activePopupOffer.title}
          </h2>
          
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed px-2">
            {activePopupOffer.description}
          </p>
          
          <div className="space-y-3 sm:space-y-4">
            <Link href="/products">
              <Button 
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                onClick={() => setIsOpen(false)}
                data-testid="button-accept-offer"
              >
                অফার নিন
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full h-9 sm:h-10 text-gray-600 hover:bg-gray-50 border-gray-300 rounded-xl text-sm sm:text-base transition-all duration-200 active:scale-95"
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