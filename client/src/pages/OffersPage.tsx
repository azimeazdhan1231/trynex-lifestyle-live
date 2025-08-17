
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift, Calendar, Clock, Star, ArrowRight, Tag, Percent, Heart, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import UltraSimpleLayout from "@/components/ultra-simple-layout";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { formatPrice, createWhatsAppUrl, COMPANY_NAME } from "@/lib/constants";
import type { Offer, Product } from "@shared/schema";

const OffersPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [favoriteOffers, setFavoriteOffers] = useState<string[]>([]);

  // Load offers
  const { data: offers = [], isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
    staleTime: 1000 * 60 * 5,
  });

  // Load products for offers
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5,
  });

  const handleOfferClick = (offer: Offer) => {
    if (offer.product_id) {
      setLocation(`/product/${offer.product_id}`);
    } else if (offer.category) {
      setLocation(`/products?category=${offer.category}`);
    }
  };

  const handleToggleFavorite = (offerId: string) => {
    setFavoriteOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
    toast({
      title: favoriteOffers.includes(offerId) ? "ফেভারিট থেকে সরানো হয়েছে" : "ফেভারিটে যোগ করা হয়েছে",
      description: "অফারটি আপনার ফেভারিট তালিকায় আপডেট করা হয়েছে।",
    });
  };

  const handleShareOffer = (offer: Offer) => {
    if (navigator.share) {
      navigator.share({
        title: offer.title,
        text: offer.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "লিংক কপি করা হয়েছে",
        description: "অফারের লিংক ক্লিপবোর্ডে কপি করা হয়েছে।",
      });
    }
  };

  const handleWhatsAppOrder = (offer: Offer) => {
    const message = `আমি ${offer.title} অফারটি নিতে চাই। বিস্তারিত জানান।`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const getOfferProduct = (offer: Offer) => {
    return products.find(p => p.id === offer.product_id);
  };

  const calculateDiscountedPrice = (originalPrice: number, discountPercent: number) => {
    return originalPrice - (originalPrice * discountPercent / 100);
  };

  const activeOffers = offers.filter(offer => 
    offer.is_active && 
    (!offer.end_date || new Date(offer.end_date) > new Date())
  );

  const featuredOffers = activeOffers.filter(offer => offer.is_featured);
  const regularOffers = activeOffers.filter(offer => !offer.is_featured);

  if (offersLoading) {
    return (
      <UltraSimpleLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">অফারগুলো লোড হচ্ছে...</p>
          </div>
        </div>
      </UltraSimpleLayout>
    );
  }

  return (
    <UltraSimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">
                🎉 বিশেষ অফার 🎉
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-orange-100">
                সীমিত সময়ের জন্য অবিশ্বাস্য ছাড় এবং উপহার
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="bg-white text-red-500 text-lg px-6 py-2">
                  <Gift className="w-5 h-5 mr-2" />
                  ৫০% পর্যন্ত ছাড়
                </Badge>
                <Badge className="bg-white text-pink-500 text-lg px-6 py-2">
                  <Calendar className="w-5 h-5 mr-2" />
                  ফ্রি ডেলিভারি
                </Badge>
                <Badge className="bg-white text-orange-500 text-lg px-6 py-2">
                  <Star className="w-5 h-5 mr-2" />
                  বিশেষ গিফট
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Featured Offers */}
          {featuredOffers.length > 0 && (
            <section className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  ⭐ ফিচার্ড অফার ⭐
                </h2>
                <p className="text-lg text-gray-600">আমাদের সেরা এবং সবচেয়ে জনপ্রিয় অফারগুলো</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredOffers.map((offer) => {
                  const product = getOfferProduct(offer);
                  const isFavorite = favoriteOffers.includes(offer.id);
                  
                  return (
                    <Card key={offer.id} className="group relative overflow-hidden bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2">
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg">
                          <Star className="w-4 h-4 mr-1" />
                          ফিচার্ড
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 z-10 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`w-10 h-10 p-0 bg-white/90 backdrop-blur-sm ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
                          onClick={() => handleToggleFavorite(offer.id)}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm text-gray-600"
                          onClick={() => handleShareOffer(offer)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">{offer.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{offer.description}</p>
                        </div>

                        {offer.discount_percent && (
                          <div className="text-center mb-4">
                            <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-lg">
                              <Percent className="w-6 h-6 mr-2" />
                              {offer.discount_percent}% ছাড়
                            </div>
                          </div>
                        )}

                        {product && (
                          <div className="bg-white rounded-lg p-4 mb-4 shadow-inner">
                            <div className="flex items-center space-x-4">
                              <img
                                src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{product.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  {offer.discount_percent ? (
                                    <>
                                      <span className="text-lg font-bold text-green-600">
                                        {formatPrice(calculateDiscountedPrice(Number(product.price), offer.discount_percent))}
                                      </span>
                                      <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(Number(product.price))}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-lg font-bold text-green-600">
                                      {formatPrice(Number(product.price))}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <Button
                            onClick={() => handleOfferClick(offer)}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
                          >
                            <Gift className="w-5 h-5 mr-2" />
                            অফার নিন
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>

                          <Button
                            onClick={() => handleWhatsAppOrder(offer)}
                            variant="outline"
                            className="w-full border-green-500 text-green-600 hover:bg-green-50 font-medium py-3 rounded-lg"
                          >
                            হোয়াটসঅ্যাপে অর্ডার করুন
                          </Button>
                        </div>

                        {offer.end_date && (
                          <div className="text-center mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-center text-red-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                শেষ হবে: {new Date(offer.end_date).toLocaleDateString('bn-BD')}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Regular Offers */}
          {regularOffers.length > 0 && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  🎯 সব অফার 🎯
                </h2>
                <p className="text-lg text-gray-600">আরও দারুণ সব অফার দেখুন</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularOffers.map((offer) => {
                  const product = getOfferProduct(offer);
                  const isFavorite = favoriteOffers.includes(offer.id);
                  
                  return (
                    <Card key={offer.id} className="group relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`w-8 h-8 p-0 bg-white/90 backdrop-blur-sm ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
                          onClick={() => handleToggleFavorite(offer.id)}
                        >
                          <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm text-gray-600"
                          onClick={() => handleShareOffer(offer)}
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{offer.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{offer.description}</p>
                        </div>

                        {offer.discount_percent && (
                          <div className="text-center mb-4">
                            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg px-4 py-2">
                              <Tag className="w-4 h-4 mr-1" />
                              {offer.discount_percent}% ছাড়
                            </Badge>
                          </div>
                        )}

                        {product && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 text-sm">{product.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  {offer.discount_percent ? (
                                    <>
                                      <span className="text-green-600 font-bold">
                                        {formatPrice(calculateDiscountedPrice(Number(product.price), offer.discount_percent))}
                                      </span>
                                      <span className="text-xs text-gray-500 line-through">
                                        {formatPrice(Number(product.price))}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-green-600 font-bold">
                                      {formatPrice(Number(product.price))}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Button
                            onClick={() => handleOfferClick(offer)}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            অফার নিন
                          </Button>

                          <Button
                            onClick={() => handleWhatsAppOrder(offer)}
                            variant="outline"
                            size="sm"
                            className="w-full border-green-500 text-green-600 hover:bg-green-50"
                          >
                            হোয়াটসঅ্যাপে অর্ডার
                          </Button>
                        </div>

                        {offer.end_date && (
                          <div className="text-center mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div className="flex items-center justify-center text-yellow-600">
                              <Clock className="w-3 h-3 mr-1" />
                              <span className="text-xs">
                                শেষ: {new Date(offer.end_date).toLocaleDateString('bn-BD')}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* No Offers */}
          {activeOffers.length === 0 && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <Gift className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">কোন অফার নেই</h3>
                <p className="text-gray-600 mb-8">
                  এই মুহূর্তে কোন বিশেষ অফার চালু নেই। শীঘ্রই নতুন অফার আসবে!
                </p>
                <div className="space-y-4">
                  <Link href="/products">
                    <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg">
                      সব পণ্য দেখুন
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-500">
                    নতুন অফারের জন্য আমাদের সাথে থাকুন
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UltraSimpleLayout>
  );
};

export default OffersPage;
