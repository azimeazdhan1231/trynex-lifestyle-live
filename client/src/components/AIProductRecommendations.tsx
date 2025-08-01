import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, Heart, Filter, Sparkles, Star } from "lucide-react";
import UnifiedProductCard from "@/components/unified-product-card";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface AIRecommendationsProps {
  currentProduct?: Product;
  userBehavior?: {
    viewedProducts: string[];
    cartItems: string[];
    searchQueries: string[];
    categoryPreferences: string[];
  };
  onProductSelect?: (product: Product) => void;
  limit?: number;
}

// AI-powered recommendation engine
const generateRecommendations = async (products: Product[], userBehavior?: any, currentProduct?: Product): Promise<Product[]> => {
  try {
    const response = await fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products,
        userBehavior,
        currentProduct,
        type: 'smart_recommendations'
      })
    });

    if (response.ok) {
      const recommendations = await response.json();
      return recommendations.data || [];
    }
  } catch (error) {
    console.log('AI recommendations unavailable, using fallback');
  }

  // Fallback smart algorithm without AI
  let recommendedProducts = [...products];

  if (currentProduct) {
    // Filter by same category
    recommendedProducts = products.filter(p => 
      p.id !== currentProduct.id && 
      p.category === currentProduct.category
    );
    
    // If not enough same-category products, include others
    if (recommendedProducts.length < 4) {
      const otherProducts = products.filter(p => 
        p.id !== currentProduct.id && 
        p.category !== currentProduct.category
      );
      recommendedProducts = [...recommendedProducts, ...otherProducts];
    }
  }

  // Apply intelligent sorting
  return recommendedProducts
    .sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      
      // Boost featured products
      if (a.is_featured) scoreA += 3;
      if (b.is_featured) scoreB += 3;
      
      // Boost latest products
      if (a.is_latest) scoreA += 2;
      if (b.is_latest) scoreB += 2;
      
      // Boost best selling products
      if (a.is_best_selling) scoreA += 2;
      if (b.is_best_selling) scoreB += 2;
      
      // Price range preference (mid-range gets slight boost)
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      if (priceA >= 500 && priceA <= 2000) scoreA += 1;
      if (priceB >= 500 && priceB <= 2000) scoreB += 1;
      
      return scoreB - scoreA;
    })
    .slice(0, 8);
};

export default function AIProductRecommendations({ 
  currentProduct, 
  userBehavior, 
  onProductSelect, 
  limit = 8 
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'smart' | 'trending' | 'similar' | 'popular'>('smart');

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!products.length) return;
      
      setIsLoading(true);
      try {
        const recommended = await generateRecommendations(products, userBehavior, currentProduct);
        setRecommendations(recommended.slice(0, limit));
      } catch (error) {
        console.error('Error generating recommendations:', error);
        setRecommendations(products.slice(0, limit));
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [products, currentProduct, userBehavior, limit]);

  const filterRecommendations = (type: typeof filterType) => {
    setFilterType(type);
    let filtered = [...products];

    switch (type) {
      case 'trending':
        filtered = products.filter(p => p.is_latest).slice(0, limit);
        break;
      case 'popular':
        filtered = products.filter(p => p.is_best_selling).slice(0, limit);
        break;
      case 'similar':
        if (currentProduct) {
          filtered = products.filter(p => 
            p.category === currentProduct.category && p.id !== currentProduct.id
          ).slice(0, limit);
        }
        break;
      default:
        // Keep existing smart recommendations
        return;
    }
    
    setRecommendations(filtered);
  };

  if (!products.length) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">AI সুপারিশ</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="w-5 h-5 text-blue-600" />
              <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <CardTitle className="text-lg text-gray-800">
              AI স্মার্ট সুপারিশ
            </CardTitle>
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-700">
              উন্নত
            </Badge>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === 'smart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => filterRecommendations('smart')}
              className="text-xs px-3 py-1 h-8"
            >
              <Brain className="w-3 h-3 mr-1" />
              স্মার্ট
            </Button>
            <Button
              variant={filterType === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => filterRecommendations('trending')}
              className="text-xs px-3 py-1 h-8"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              ট্রেন্ডিং
            </Button>
            <Button
              variant={filterType === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => filterRecommendations('popular')}
              className="text-xs px-3 py-1 h-8"
            >
              <Star className="w-3 h-3 mr-1" />
              জনপ্রিয়
            </Button>
            {currentProduct && (
              <Button
                variant={filterType === 'similar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => filterRecommendations('similar')}
                className="text-xs px-3 py-1 h-8"
              >
                <Filter className="w-3 h-3 mr-1" />
                একই ধরনের
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {recommendations.map((product) => (
              <div key={product.id} className="relative group">
                <UnifiedProductCard
                  product={product}
                  onAddToCart={() => {}}
                  onCustomize={() => onProductSelect?.(product)}
                  onQuickView={() => onProductSelect?.(product)}
                  isCompact={true}
                />
                {/* AI confidence indicator */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="secondary" className="text-xs bg-blue-500 text-white">
                    <Brain className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>কোনো সুপারিশ পাওয়া যায়নি</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}