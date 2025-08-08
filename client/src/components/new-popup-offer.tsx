import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Gift, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Offer } from "@shared/schema";

export default function NewPopupOffer() {
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
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        width: '100vw',
        zIndex: 99999
      }}
      onClick={(e) => {
        // Close when clicking outside the modal
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-auto animate-in zoom-in-95 duration-500"
        style={{ 
          position: 'relative',
          zIndex: 100000,
          maxHeight: '90vh',
          overflow: 'auto',
          margin: '20px' // Ensure space around the modal for the close button
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-4 -right-4 w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 z-[100001]"
          style={{
            position: 'absolute',
            top: '-16px',
            right: '-16px'
          }}
          data-testid="button-close-popup"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-t-3xl p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            🎉 স্বাগতম অফার!
          </h2>
          <p className="text-green-100 text-sm">
            ১৫০০+ টাকার অর্ডারে বিশেষ ছাড়
          </p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200 mb-4">
              <Tag className="w-4 h-4 text-orange-600" />
              <span className="font-bold text-orange-800">TRYNEX15</span>
            </div>
            
            <div className="text-3xl font-bold text-green-600 mb-2">
              ১৫% ছাড়
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              ১৫০০ টাকা বা তার বেশি অর্ডারে <strong>TRYNEX15</strong> কোড ব্যবহার করুন
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/products">
              <Button 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsOpen(false)}
                data-testid="button-accept-offer"
              >
                এখনই কিনুন
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              className="w-full h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm"
              onClick={() => setIsOpen(false)}
              data-testid="button-dismiss-offer"
            >
              পরে দেখব
            </Button>
          </div>

          {/* Fine print */}
          <p className="text-xs text-gray-400 mt-4">
            * শর্ত প্রযোজ্য। সীমিত সময়ের জন্য।
          </p>
        </div>
      </div>
    </div>
  );
}