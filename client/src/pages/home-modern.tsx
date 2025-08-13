import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import UltraSimpleLayout from "@/components/ultra-simple-layout";
import ModernHeroSection from "@/components/modern-hero-section";
import ModernCategoryShowcase from "@/components/modern-category-showcase";
import FeaturedProductsSection from "@/components/featured-products-section";
import UltraDynamicProductModal from "@/components/ultra-dynamic-product-modal";
import ProductCustomizationModal from "@/components/ProductCustomizationModal";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Truck, 
  HeadphonesIcon, 
  Heart,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  Gift,
  Clock,
  CheckCircle,
  Phone,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { COMPANY_NAME, WHATSAPP_NUMBER, createWhatsAppUrl } from "@/lib/constants";
import type { Product } from "@shared/schema";

const ModernHomePage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch latest stats (you can expand this with real API calls)
  const stats = [
    { icon: Users, label: "খুশি গ্রাহক", value: "১০,০০০+", color: "text-blue-500" },
    { icon: Gift, label: "মোট অর্ডার", value: "২৫,০০০+", color: "text-green-500" },
    { icon: Star, label: "গড় রেটিং", value: "৪.৮/৫", color: "text-yellow-500" },
    { icon: Truck, label: "সফল ডেলিভারি", value: "৯৮%", color: "text-orange-500" }
  ];

  const features = [
    {
      icon: Shield,
      title: "১০০% নিরাপদ পেমেন্ট",
      description: "bKash, Nagad এবং ক্যাশ অন ডেলিভারি সুবিধা",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Truck,
      title: "দ্রুত ডেলিভারি",
      description: "ঢাকায় ১ দিন, বাইরে ২-৩ দিনের মধ্যে",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: HeadphonesIcon,
      title: "২৪/৭ কাস্টমার সাপোর্ট",
      description: "যেকোনো সময় আমাদের সাথে যোগাযোগ করুন",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "কাস্টমাইজেশন সুবিধা",
      description: "আপনার পছন্দমতো ডিজাইন করান",
      color: "from-red-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "রহিমা খাতুন",
      rating: 5,
      comment: "অসাধারণ মানের পণ্য এবং দ্রুত ডেলিভারি। খুবই সন্তুষ্ট।",
      product: "কাস্টম টি-শার্ট",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    },
    {
      id: 2,
      name: "করিম উদ্দিন",
      rating: 5,
      comment: "ডিজাইনের মান এবং প্রিন্টের কোয়ালিটি দেখে মুগ্ধ হয়েছি।",
      product: "পার্সোনালাইজড মগ",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    },
    {
      id: 3,
      name: "ফাতেমা আক্তার",
      rating: 5,
      comment: "গিফট হিসেবে অর্ডার করেছিলাম। সবাই খুশি হয়েছে।",
      product: "জন্মদিনের গিফট সেট",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    }
  ];

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  const handleWhatsAppContact = () => {
    const message = "হ্যালো! আমি আপনাদের পণ্য সম্পর্কে জানতে চাই।";
    window.open(createWhatsAppUrl(message), '_blank');
  };

  return (
    <>
      <UltraSimpleLayout>
        {/* Modern Hero Section */}
        <ModernHeroSection />

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <IconComponent className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                      <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Category Showcase */}
        <ModernCategoryShowcase />

        {/* Featured Products */}
        <FeaturedProductsSection />

        {/* Features Section */}
        <section className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Badge className="bg-orange-100 text-orange-800 px-4 py-2 mb-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                আমাদের বিশেষত্ব
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                কেন আমাদের বেছে নেবেন?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                আমরা আপনাকে সর্বোচ্চ মানের পণ্য এবং সেবা প্রদানে প্রতিশ্রুতিবদ্ধ
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white h-full">
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 mb-4">
                <Heart className="w-4 h-4 mr-2" />
                গ্রাহকদের মতামত
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                আমাদের গ্রাহকরা কী বলছেন?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                হাজার হাজার সন্তুষ্ট গ্রাহকের পজিটিভ রিভিউ এবং অভিজ্ঞতা
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white h-full">
                    <CardContent className="p-6">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 mb-6 italic leading-relaxed">
                        "{testimonial.comment}"
                      </p>

                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {testimonial.product}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                আজই শুরু করুন আপনার শপিং যাত্রা
              </h2>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                হাজার হাজার পণ্যের বিশাল সংগ্রহ এবং কাস্টমাইজেশন সুবিধা নিয়ে আমরা আছি আপনার সেবায়
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  onClick={() => setLocation('/products')}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform transition-all duration-300 hover:scale-105 shadow-2xl"
                >
                  <Gift className="mr-2 w-5 h-5" />
                  শপিং শুরু করুন
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={handleWhatsAppContact}
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold px-8 py-4 rounded-full transform transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  WhatsApp এ যোগাযোগ
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </UltraSimpleLayout>

      {/* Product Modal */}
      <UltraDynamicProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onCustomize={handleCustomize}
      />

      {/* Customize Modal */}
      <ProductCustomizationModal
        product={selectedProduct}
        isOpen={isCustomizeModalOpen}
        onClose={() => {
          setIsCustomizeModalOpen(false);
          setSelectedProduct(null);
        }}
        onOrderPlaced={(trackingId) => {
          toast({
            title: "অর্ডার সফল!",
            description: `আপনার অর্ডার নম্বর: ${trackingId}`,
          });
          setIsCustomizeModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </>
  );
};

export default ModernHomePage;