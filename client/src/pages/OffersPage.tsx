import Layout from "@/components/Layout";
import OfferGrid from "@/components/OfferGrid";

const OffersPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">বিশেষ অফার</h1>
        <OfferGrid />
      </div>
    </Layout>
  );
};

export default OffersPage;
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Clock, Star, ArrowRight } from "lucide-react";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { useLocation } from "wouter";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  valid_until: string;
  image_url?: string;
  is_active: boolean;
}

const OffersPage = () => {
  const [, setLocation] = useLocation();

  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleOrderNow = (offer: Offer) => {
    const message = `আমি এই অফারটি নিতে চাই: ${offer.title} - ${formatPrice(offer.discounted_price)}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  if (isLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">বিশেষ অফার</h1>
            <p className="text-gray-600">আমাদের সেরা ডিলগুলো দেখুন</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">🎁 বিশেষ অফার</h1>
          <p className="text-gray-600">সীমিত সময়ের জন্য আমাদের সেরা ডিলগুলো দেখুন</p>
        </div>

        {/* Active Offers */}
        {offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.filter(offer => offer.is_active).map((offer) => (
              <Card key={offer.id} className="group hover:shadow-lg transition-shadow duration-300 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <Badge variant="destructive" className="bg-red-500 text-white font-bold px-3 py-1">
                      {offer.discount_percentage}% ছাড়
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">বিশেষ</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {offer.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {offer.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={offer.image_url} 
                        alt={offer.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {offer.description}
                  </p>
                  
                  {/* Price Section */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(offer.discounted_price)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(offer.original_price)}
                      </span>
                    </div>
                    <div className="text-sm text-green-700 font-medium">
                      আপনি সাশ্রয় করবেন: {formatPrice(offer.original_price - offer.discounted_price)}
                    </div>
                  </div>
                  
                  {/* Validity */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>বৈধ: {new Date(offer.valid_until).toLocaleDateString('bn-BD')}</span>
                  </div>
                  
                  {/* Action Button */}
                  <Button 
                    onClick={() => handleOrderNow(offer)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    এখনই অর্ডার করুন
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* No Offers State */
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">কোনো অফার পাওয়া যায়নি</h2>
            <p className="text-gray-500 mb-6">এই মুহূর্তে কোনো বিশেষ অফার নেই। শীঘ্রই নতুন অফার আসবে!</p>
            <Button 
              onClick={() => setLocation('/')}
              variant="outline" 
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              হোম পেজে ফিরে যান
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-3 text-gray-900">আরও অফার চান?</h3>
          <p className="text-gray-600 mb-6">
            আমাদের সাথে হোয়াটসঅ্যাপে যোগাযোগ করুন এবং বিশেষ ছাড় পান
          </p>
          <Button 
            onClick={() => window.open(createWhatsAppUrl("আমি বিশেষ অফার সম্পর্কে জানতে চাই"), '_blank')}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3"
          >
            হোয়াটসঅ্যাপে যোগাযোগ করুন
          </Button>
        </div>
      </div>
    </MobileOptimizedLayout>
  );
};

export default OffersPage;
