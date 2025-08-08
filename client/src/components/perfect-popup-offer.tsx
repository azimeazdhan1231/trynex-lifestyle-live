import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Gift, Sparkles, ArrowRight, Clock, Tag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Offer } from "@shared/schema";

export default function PerfectPopupOffer() {
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

  // Format countdown time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle outside click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (!activePopupOffer || !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        width: '100vw',
        zIndex: 99999,
        touchAction: 'none'
      }}
      onClick={handleOverlayClick}
      data-testid="popup-overlay"
    >
      <div 
        className={`relative bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-500 ${
          isAnimating 
            ? 'scale-95 opacity-0 translate-y-8' 
            : 'scale-100 opacity-100 translate-y-0 animate-in zoom-in-95 slide-in-from-bottom-8'
        }`}
        style={{ 
          position: 'relative',
          zIndex: 100000,
          maxHeight: '85vh',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="popup-content"
      >
        {/* Close Button */}
        <button
          onClick={closePopup}
          className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 z-[100001] border-4 border-white"
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px'
          }}
          aria-label="বন্ধ করুন"
          data-testid="button-close-popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full animate-pulse delay-1000"></div>
        </div>

        {/* Header Section with Icon */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 rounded-t-3xl p-6 text-center overflow-hidden">
          {/* Animated sparkles */}
          <div className="absolute inset-0">
            <Sparkles className="absolute top-3 left-6 w-4 h-4 text-white/60 animate-pulse" />
            <Sparkles className="absolute top-8 right-8 w-3 h-3 text-white/40 animate-pulse delay-500" />
            <Star className="absolute bottom-4 left-8 w-3 h-3 text-yellow-300/80 animate-pulse delay-1000" />
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg border border-white/30">
              <Gift className="w-10 h-10 text-white animate-bounce" />
            </div>
            
            <Badge className="bg-white/20 text-white border-white/30 text-sm font-bold px-3 py-1 mb-2">
              <Clock className="w-3 h-3 mr-1" />
              সীমিত সময়ের অফার
            </Badge>
            
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
              🎉 {activePopupOffer.title}
            </h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative p-6 space-y-6">
          {/* Offer Description */}
          <div className="text-center">
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {activePopupOffer.description}
            </p>
            
            {/* Countdown Timer */}
            {timeLeft > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-700">অফার শেষ হবে</span>
                </div>
                <div className="text-3xl font-bold text-red-600 font-mono tracking-wider">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-red-500 mt-1">ঘন্টা : মিনিট : সেকেন্ড</div>
              </div>
            )}

            {/* Offer Highlights */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <Tag className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold text-green-700">বিশেষ ছাড়</div>
                <div className="text-xs text-green-600">সকল পণ্যে</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <Gift className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-semibold text-blue-700">ফ্রি ডেলিভারি</div>
                <div className="text-xs text-blue-600">সারাদেশে</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/products">
              <Button 
                className="w-full h-14 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-98 group relative overflow-hidden"
                onClick={closePopup}
                data-testid="button-accept-offer"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  অফার নিন এখনই
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full h-12 text-gray-700 hover:bg-gray-50 border-gray-300 rounded-xl text-base transition-all duration-200 active:scale-98 hover:border-gray-400"
              onClick={closePopup}
              data-testid="button-dismiss-offer"
            >
              পরে দেখব
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span>১০০% নিরাপদ</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Gift className="w-3 h-3 text-green-500" />
              <span>গ্যারান্টি সহ</span>
            </div>
          </div>

          {/* Fine Print */}
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            * শর্ত প্রযোজ্য। সীমিত সময়ের জন্য। কোন লুকানো চার্জ নেই।
          </p>
        </div>
      </div>
    </div>
  );
}