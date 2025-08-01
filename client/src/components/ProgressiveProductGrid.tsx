import { useState, useEffect } from 'react';
import UnifiedProductCard from "./unified-product-card";
import type { Product } from "@shared/schema";

interface ProgressiveProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  title?: string;
}

export default function ProgressiveProductGrid({
  products,
  onAddToCart,
  onViewProduct,
  onCustomize,
  title
}: ProgressiveProductGridProps) {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      setDisplayedProducts([]);
      return;
    }

    setIsAnimating(true);
    setDisplayedProducts([]);

    // Show products progressively - 2 at a time every 150ms
    let index = 0;
    const interval = setInterval(() => {
      if (index >= products.length) {
        clearInterval(interval);
        setIsAnimating(false);
        return;
      }

      const nextProducts = products.slice(index, index + 2);
      setDisplayedProducts(prev => [...prev, ...nextProducts]);
      index += 2;
    }, 150);

    return () => clearInterval(interval);
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4">
                <div className="h-60 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          {isAnimating && (
            <p className="text-sm text-blue-600">
              পণ্য লোড হচ্ছে... ({displayedProducts.length}/{products.length})
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedProducts.map((product, index) => (
          <div 
            key={product.id} 
            className="animate-fadeIn"
            style={{
              animationDelay: `${(index % 2) * 100}ms`
            }}
          >
            <UnifiedProductCard
              product={product}
              onAddToCart={onAddToCart}
              onViewProduct={onViewProduct}
              onCustomize={onCustomize || (() => {})}
            />
          </div>
        ))}
      </div>
    </div>
  );
}