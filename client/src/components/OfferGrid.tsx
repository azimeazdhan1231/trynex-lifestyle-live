import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatPrice } from "@/lib/constants";
import { Calendar, Gift, Percent, ExternalLink } from "lucide-react";
import type { Offer } from "@shared/schema";

export default function OfferGrid() {
  const { data: offers = [], isLoading, error } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">অফার লোড করতে সমস্যা হয়েছে।</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-8">
        <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">কোনো অফার পাওয়া যায়নি।</p>
      </div>
    );
  }

  const activeOffers = offers.filter(offer => offer.active);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeOffers.map((offer) => (
        <Card key={offer.id} className="group hover:shadow-lg transition-shadow duration-200" data-testid={`card-offer-${offer.id}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {offer.title}
                </CardTitle>
                {offer.discount_percentage && offer.discount_percentage > 0 && (
                  <Badge variant="secondary" className="mt-2 bg-red-100 text-red-800">
                    <Percent className="h-3 w-3 mr-1" />
                    {offer.discount_percentage}% ছাড়
                  </Badge>
                )}
              </div>
              {offer.active && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  সক্রিয়
                </Badge>
              )}
            </div>
          </CardHeader>

          {offer.image_url && (
            <div className="px-6">
              <img
                src={offer.image_url}
                alt={offer.title}
                className="w-full h-48 object-cover rounded-lg"
                data-testid={`img-offer-${offer.id}`}
              />
            </div>
          )}

          <CardContent className="space-y-4">
            {offer.description && (
              <CardDescription className="text-gray-700">
                {offer.description}
              </CardDescription>
            )}

            <div className="space-y-2">
              {offer.min_order_amount && Number(offer.min_order_amount) > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Gift className="h-4 w-4 mr-2" />
                  ন্যূনতম অর্ডার: {formatPrice(Number(offer.min_order_amount))}
                </div>
              )}

              {offer.expiry && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  মেয়াদ: {new Date(offer.expiry).toLocaleDateString('bn-BD')}
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                if (offer.button_link) {
                  window.location.href = offer.button_link;
                }
              }}
              data-testid={`button-offer-${offer.id}`}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {offer.button_text || "অর্ডার করুন"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}