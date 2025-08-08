import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Gift, Sparkles, ArrowRight, Clock, Tag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Offer } from "@shared/schema";
import PerfectPopupCSSFix from './perfect-popup-css-fix';

export default function FixedPerfectPopupOffer() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Load popup offers
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  const activePopupOffer = offers.find(offer => offer.active && offer.is_popup);

  // Handle popup close with animation
  const closePopup = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
      // Remove from history when closing
      if (window.history.state?.popup) {
        window.history.back();
      }
    }, 300);
  }, []);

  // Handle escape key and outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopup();
      }
    };

    const handleBackButton = () => {
      closePopup();
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, closePopup]);

  // Show popup after delay
  useEffect(() => {
    if (activePopupOffer && !hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
        
        // Add to browser history to handle back button
        window.history.pushState({ popup: true }, '');
      }, activePopupOffer.popup_delay || 3000);

      return () => clearTimeout(timer);
    }
  }, [activePopupOffer, hasShown]);

  // Countdown timer for urgency
  useEffect(() => {
    if (isOpen && activePopupOffer) {
      // Set initial countdown (24 hours in seconds)
      setTimeLeft(24 * 60 * 60);
      
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, activePopupOffer]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activePopupOffer) return null;

  return (
    <>
      <PerfectPopupCSSFix />
      {/* Popup Modal */}
      {isOpen && (
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-[9999] transition-all duration-300 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
          onClick={closePopup}
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          data-testid="popup-overlay"
        >
          <div 
            className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto max-h-[95vh] overflow-hidden transform transition-all duration-300 ${
              isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative'
            }}
            data-testid="popup-content"
          >
            {/* Close Button - Perfectly Positioned */}
            <button
              onClick={closePopup}
              className="absolute -top-2 -right-2 z-50 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg touch-button border-2 border-white"
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
              data-testid="popup-close-button"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Content Container */}
            <div className="popup-scrollable-content">
              {/* Header Section */}
              <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white p-6 text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                </div>

                {/* Gift Icon */}
                <div className="relative z-10 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    <h2 className="text-lg font-bold">বিশেষ অফার</h2>
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  </div>
                  
                  <p className="text-sm opacity-90 leading-relaxed">
                    ১০০০ টাকার বেশি কেনাকাটায় বিশেষ ছাড় পাবেন
                  </p>
                </div>
              </div>

              {/* Timer Section */}
              <div className="p-4 bg-red-50 border-b border-red-100">
                <div className="text-center">
                  <p className="text-sm text-red-600 mb-2 font-medium">অফার শেষ হবে</p>
                  <div className="bg-red-500 text-white px-4 py-3 rounded-lg font-mono text-lg font-bold tracking-wider shadow-md">
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-xs text-red-500 mt-1">ঘন্টা : মিনিট : সেকেন্ড</p>
                </div>
              </div>

              {/* Offer Details */}
              <div className="p-4 space-y-4">
                {/* Benefits */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                    <Tag className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700">বিনামূল্যে ডেলিভারি</p>
                    <p className="text-xs text-green-600">সারা দেশে</p>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                    <Star className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-700">বিশেষ গিফট</p>
                    <p className="text-xs text-blue-600">প্রতিটি অর্ডারে</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link href="/products">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 touch-button"
                      onClick={closePopup}
                      style={{
                        touchAction: 'manipulation',
                        minHeight: '48px'
                      }}
                      data-testid="popup-shop-button"
                    >
                      এখনই কেনাকাটা করুন
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>

                  <Button 
                    variant="outline" 
                    className="w-full py-3 text-base rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 touch-button"
                    onClick={closePopup}
                    style={{
                      touchAction: 'manipulation',
                      minHeight: '48px'
                    }}
                    data-testid="popup-close-text-button"
                  >
                    পরে দেখব
                  </Button>
                </div>

                {/* Terms */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>* শুধুমাত্র আজকের জন্য বৈধ</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    * নিয়ম ও শর্ত প্রযোজ্য
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}