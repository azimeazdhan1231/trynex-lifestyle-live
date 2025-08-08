
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Calendar } from "lucide-react";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import { useCart } from "@/hooks/use-cart";
import { createWhatsAppUrl } from "@/lib/constants";
import type { Offer } from "@shared/schema";

export default function OffersPage() {
  const { totalItems } = useCart();

  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  const activeOffers = offers.filter(offer => offer.active);
  const expiredOffers = offers.filter(offer => !offer.active);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (isLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="pt-20 container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      
      <div className="pt-20 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">বিশেষ অফার</h1>
            <p className="text-gray-600 text-lg">আমাদের সেরা ডিল এবং অফারসমূহ</p>
          </div>

          {/* Active Offers */}
          {activeOffers.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Gift className="w-6 h-6 mr-2 text-green-600" />
                চলমান অফার
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOffers.map((offer) => (
                  <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          সক্রিয়
                        </Badge>
                        {offer.expiry && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(offer.expiry)}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{offer.title}</h3>
                      <p className="text-gray-600 mb-6">{offer.description}</p>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(createWhatsAppUrl(`আমি "${offer.title}" অফারটি সম্পর্কে জানতে চাই।`), '_blank')}
                      >
                        অফার নিন
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Previous Offers */}
          {expiredOffers.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-gray-500" />
                পূর্বের অফার
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredOffers.map((offer) => (
                  <Card key={offer.id} className="overflow-hidden opacity-75 border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          শেষ
                        </Badge>
                        {offer.expiry && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(offer.expiry)}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-600 mb-3">{offer.title}</h3>
                      <p className="text-gray-500 mb-6">{offer.description}</p>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        disabled
                      >
                        অফার শেষ
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Offers */}
          {offers.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">বর্তমানে কোন অফার নেই</p>
              <p className="text-gray-400 mt-2">নতুন অফারের জন্য অপেক্ষা করুন</p>
            </div>
          )}
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}
