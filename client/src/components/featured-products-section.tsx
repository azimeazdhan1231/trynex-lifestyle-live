import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles,
  TrendingUp,
  Star,
  Clock,
  ArrowRight,
  Package
} from "lucide-react";
import { useLocation } from "wouter";
import ModernProductCard from "./modern-product-card";
import UltraDynamicProductModal from "./ultra-dynamic-product-modal";
import ProductCustomizationModal from "./ProductCustomizationModal";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

const FeaturedProductsSection = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5,
  });

  // Categorize products
  const categorizedProducts = useMemo(() => {
    const featured = products.filter(p => p.is_featured).slice(0, 8);
    const trending = products.filter(p => p.is_best_selling).slice(0, 8);
    const latest = products.filter(p => p.is_latest).slice(0, 8);
    const popular = products.sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 8);
    
    // If no products in specific categories, show all products as fallback
    const fallbackProducts = products.slice(0, 8);
    
    return {
      featured: featured.length > 0 ? featured : fallbackProducts,
      trending: trending.length > 0 ? trending : fallbackProducts,
      latest: latest.length > 0 ? latest : fallbackProducts,
      popular: popular.length > 0 ? popular : fallbackProducts
    };
  }, [products]);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCustomize = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  const productTabs = [
    {
      id: "featured",
      label: "ফিচার্ড",
      icon: Sparkles,
      products: categorizedProducts.featured,
      description: "বিশেষভাবে নির্বাচিত সেরা পণ্য",
      color: "text-orange-500"
    },
    {
      id: "trending",
      label: "ট্রেন্ডিং",
      icon: TrendingUp,
      products: categorizedProducts.trending,
      description: "এই মুহূর্তে সবচেয়ে জনপ্রিয় পণ্য",
      color: "text-red-500"
    },
    {
      id: "latest",
      label: "নতুন",
      icon: Clock,
      products: categorizedProducts.latest,
      description: "সাম্প্রতিক যুক্ত হওয়া পণ্য",
      color: "text-green-500"
    },
    {
      id: "popular",
      label: "জনপ্রিয়",
      icon: Star,
      products: categorizedProducts.popular,
      description: "গ্রাহকদের পছন্দের পণ্য",
      color: "text-blue-500"
    }
  ];

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="bg-orange-100 text-orange-800 px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              বিশেষ সংগ্রহ
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              আমাদের সেরা পণ্যসমূহ
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              মানসম্পন্ন এবং আকর্ষণীয় পণ্যের বিশাল সংগ্রহ থেকে বেছে নিন আপনার পছন্দের আইটেম
            </p>
          </motion.div>

          {/* Product Tabs */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs defaultValue="featured" className="w-full">
              {/* Tab List */}
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-100 p-2 rounded-2xl">
                {productTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl py-3 px-4 transition-all duration-300"
                    >
                      <IconComponent className={`w-4 h-4 ${tab.color}`} />
                      <span className="font-medium">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Tab Content */}
              {productTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-8">
                  {/* Tab Description */}
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">{tab.description}</p>
                  </div>

                  {/* Products Grid */}
                  {tab.products.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                      {tab.products.map((product, index) => (
                        <ModernProductCard
                          key={`${tab.id}-${product.id}`}
                          product={product}
                          onViewDetails={handleViewProduct}
                          onCustomize={handleCustomize}
                          index={index}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        কোনো পণ্য পাওয়া যায়নি
                      </h3>
                      <p className="text-gray-500 mb-6">
                        এই ক্যাটেগরিতে এখনো কোনো পণ্য যুক্ত করা হয়নি
                      </p>
                      <Button
                        onClick={() => setLocation('/products')}
                        variant="outline"
                      >
                        সব পণ্য দেখুন
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  )}

                  {/* View All Button */}
                  {tab.products.length > 0 && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-center"
                    >
                      <Button
                        onClick={() => setLocation('/products')}
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-full font-medium transform transition-all duration-300 hover:scale-105"
                      >
                        আরও {tab.label} পণ্য দেখুন
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </section>

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

export default FeaturedProductsSection;