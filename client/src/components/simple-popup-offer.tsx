import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Gift, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Offer } from "@shared/schema";

export default function SimplePopupOffer() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Load popup offers
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  const activePopupOffer = offers.find(offer => offer.active && offer.is_popup);

  // Show popup after delay
  useEffect(() => {
    if (activePopupOffer && !hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activePopupOffer, hasShown]);

  // Countdown timer
  useEffect(() => {
    if (isOpen && activePopupOffer) {
      setTimeLeft(24 * 60 * 60);
      const interval = setInterval(() => {
        setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activePopupOffer]);

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activePopupOffer || !isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Perfect Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-3 -right-3 z-50 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center border-3 border-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 touch-friendly group"
          style={{ 
            fontSize: '14px',
            minWidth: '44px',
            minHeight: '44px',
            WebkitTapHighlightColor: 'transparent'
          }}
          aria-label="Close popup"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-700 text-white p-6 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold mb-2">বিশেষ অফার</h2>
          <p className="text-sm opacity-90">১০০০ টাকার বেশি কেনাকাটায় বিশেষ ছাড়</p>
        </div>

        {/* Timer */}
        <div className="p-4 bg-red-50 text-center">
          <p className="text-sm text-red-600 mb-2">অফার শেষ হবে</p>
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-mono text-lg font-bold">
            {formatTime(timeLeft)}
          </div>
          <p className="text-xs text-red-500 mt-1">ঘন্টা : মিনিট : সেকেন্ড</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700">বিনামূল্যে ডেলিভারি</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700">বিশেষ গিফট</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/products">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
                onClick={() => setIsOpen(false)}
              >
                এখনই কেনাকাটা করুন
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Button 
              variant="outline" 
              className="w-full py-3 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              পরে দেখব
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              <Clock className="w-3 h-3 inline mr-1" />
              শুধুমাত্র আজকের জন্য বৈধ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}