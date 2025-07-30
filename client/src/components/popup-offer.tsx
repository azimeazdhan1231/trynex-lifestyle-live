import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "wouter";
import type { Offer } from "@shared/schema";

export default function PopupOffer() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Load popup offers
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  const popupOffer = offers.find(offer => offer.active && offer.is_popup);

  useEffect(() => {
    if (popupOffer && !hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, popupOffer.popup_delay || 3000);

      return () => clearTimeout(timer);
    }
  }, [popupOffer, hasShown]);

  if (!popupOffer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-primary to-emerald-600 text-white border-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="absolute right-2 top-2 text-white hover:bg-white/20 z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <Gift className="w-16 h-16 text-yellow-300 animate-bounce" />
          </div>
          
          <h3 className="text-2xl font-bold mb-2">{popupOffer.title}</h3>
          
          {popupOffer.description && (
            <p className="text-lg mb-4 text-emerald-100">{popupOffer.description}</p>
          )}

          {popupOffer.discount_percentage && popupOffer.discount_percentage > 0 && (
            <div className="bg-yellow-400 text-gray-900 rounded-full px-4 py-2 font-bold text-xl mb-4 inline-block">
              {popupOffer.discount_percentage}% ছাড়!
            </div>
          )}

          {popupOffer.min_order_amount && Number(popupOffer.min_order_amount) > 0 && (
            <p className="text-sm text-emerald-200 mb-4">
              ন্যূনতম অর্ডার: ৳{popupOffer.min_order_amount}
            </p>
          )}

          {popupOffer.expiry && (
            <p className="text-sm text-emerald-200 mb-6">
              মেয়াদ: {new Date(popupOffer.expiry).toLocaleDateString('bn-BD')}
            </p>
          )}

          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 font-bold text-lg px-8 py-3 w-full"
          >
            <Link href={popupOffer.button_link || "/products"}>
              {popupOffer.button_text || "অর্ডার করুন"}
            </Link>
          </Button>
        </div>

        {popupOffer.image_url && (
          <div className="h-32 bg-white/10 flex items-center justify-center">
            <img
              src={popupOffer.image_url}
              alt={popupOffer.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}