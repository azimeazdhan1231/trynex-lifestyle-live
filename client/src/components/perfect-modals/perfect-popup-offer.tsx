import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { 
  X, 
  Gift, 
  Star, 
  Zap, 
  Sparkles,
  Clock,
  Tag
} from 'lucide-react';

interface PerfectPopupOfferProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function PerfectPopupOffer({ isOpen = false, onClose }: PerfectPopupOfferProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);

  React.useEffect(() => {
    // Show popup after 3 seconds on first visit
    const timer = setTimeout(() => {
      if (!hasInteracted && !localStorage.getItem('popup-offer-dismissed')) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const handleClose = () => {
    setIsVisible(false);
    setHasInteracted(true);
    localStorage.setItem('popup-offer-dismissed', 'true');
    onClose?.();
  };

  const handleAcceptOffer = () => {
    // In real app, this would apply the discount code
    console.log('Offer accepted! Applying discount code: WELCOME20');
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 border-0 shadow-2xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 text-white text-center">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <Gift className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-4">
            Special Offer!
          </h2>

          {/* Badge */}
          <div className="mb-6">
            <Badge className="bg-yellow-400 text-yellow-900 border-0 text-lg font-bold px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              20% OFF
            </Badge>
          </div>

          {/* Description */}
          <p className="text-lg mb-6 text-white/90">
            Welcome to TryneX Lifestyle Shop! Get 20% off your first order with code:
          </p>

          {/* Discount Code */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Tag className="w-5 h-5" />
              <span className="text-sm text-white/80">Use Code:</span>
            </div>
            <div className="text-2xl font-mono font-bold bg-white text-purple-600 px-4 py-2 rounded">
              WELCOME20
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center gap-3 text-white/90">
              <Star className="w-5 h-5 text-yellow-300 fill-current" />
              <span>Valid on all custom products</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span>Free shipping included</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Clock className="w-5 h-5 text-yellow-300" />
              <span>Limited time offer</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAcceptOffer}
              className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold text-lg py-3"
              size="lg"
            >
              Claim 20% Off Now!
            </Button>
            
            <Button
              onClick={handleClose}
              variant="ghost"
              className="w-full text-white hover:bg-white/20"
            >
              Maybe Later
            </Button>
          </div>

          {/* Terms */}
          <p className="text-xs text-white/60 mt-6">
            *Offer valid for first-time customers only. Cannot be combined with other promotions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 