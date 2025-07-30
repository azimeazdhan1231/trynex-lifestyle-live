
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Gift, Clock, Percent } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { PopupOffer } from "@shared/schema";

export default function PopupOfferModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const { data: offer } = useQuery<PopupOffer | null>({
    queryKey: ["/api/popup-offers/active"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/popup-offers/active");
        if (!response.ok) return null;
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching popup offer:", error);
        return null;
      }
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  useEffect(() => {
    if (offer && offer.is_active && !hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
        localStorage.setItem(`popup-offer-${offer.id}`, 'shown');
      }, offer.delay_seconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [offer, hasShown]);

  useEffect(() => {
    if (offer) {
      const hasSeenOffer = localStorage.getItem(`popup-offer-${offer.id}`);
      if (hasSeenOffer) {
        setHasShown(true);
      }
    }
  }, [offer]);

  if (!offer || !offer.is_active) return null;

  const handleClose = () => {
    setIsOpen(false);
    if (offer.auto_close_seconds) {
      setTimeout(() => setIsOpen(false), offer.auto_close_seconds * 1000);
    }
  };

  const handleAction = () => {
    if (offer.action_url) {
      window.open(offer.action_url, '_blank');
    }
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-[90vw] md:max-w-[600px] max-h-[90vh] overflow-auto p-0 gap-0"
        style={{
          backgroundColor: offer.background_color || '#ffffff',
          color: offer.text_color || '#000000'
        }}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6 text-center space-y-6">
          {/* Header with Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">
            {offer.title}
          </h2>

          {/* Subtitle */}
          {offer.subtitle && (
            <p className="text-lg opacity-80">
              {offer.subtitle}
            </p>
          )}

          {/* Description */}
          <p className="text-base leading-relaxed max-w-md mx-auto">
            {offer.description}
          </p>

          {/* Discount Badge */}
          {offer.discount_percentage && (
            <div className="flex justify-center">
              <Badge className="text-lg px-4 py-2 bg-red-500 text-white">
                <Percent className="w-4 h-4 mr-1" />
                {offer.discount_percentage}% ছাড়
              </Badge>
            </div>
          )}

          {/* Offer Details */}
          <div className="bg-white/10 rounded-lg p-4 space-y-2">
            {offer.min_order_amount && (
              <p className="text-sm">
                <strong>ন্যূনতম অর্ডার:</strong> {formatPrice(offer.min_order_amount)}
              </p>
            )}
            {offer.max_discount && (
              <p className="text-sm">
                <strong>সর্বোচ্চ ছাড়:</strong> {formatPrice(offer.max_discount)}
              </p>
            )}
            {offer.valid_until && (
              <p className="text-sm flex items-center justify-center">
                <Clock className="w-4 h-4 mr-1" />
                <strong>শেষ তারিখ:</strong> {new Date(offer.valid_until).toLocaleDateString('bn-BD')}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {offer.action_text && (
              <Button
                onClick={handleAction}
                size="lg"
                className="w-full text-lg font-semibold"
                style={{
                  backgroundColor: offer.button_color || '#059669',
                  color: offer.button_text_color || '#ffffff'
                }}
              >
                {offer.action_text}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              পরে দেখব
            </Button>
          </div>

          {/* Fine Print */}
          {offer.fine_print && (
            <p className="text-xs opacity-60 leading-relaxed">
              {offer.fine_print}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
