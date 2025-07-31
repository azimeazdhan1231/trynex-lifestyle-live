
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@shared/schema';

interface PaginatedProductGridProps {
  products: Product[];
  itemsPerPage?: number;
  onProductClick?: (product: Product) => void;
}

export default function PaginatedProductGrid({ 
  products, 
  itemsPerPage = 12,
  onProductClick 
}: PaginatedProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevious = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };

  return (
    <div className="space-y-6">
      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {currentProducts.map((product, index) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => onProductClick?.(product)}
          >
            <div className="aspect-square p-2">
              <OptimizedImage
                src={product.image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8"}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
                priority={index < 4} // Prioritize first 4 images
                width={300}
                height={300}
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-2">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                {product.stock < 5 && (
                  <span className="text-xs text-red-500 font-medium">
                    মাত্র {product.stock} টি
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>আগের</span>
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-10 h-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1"
          >
            <span>পরের</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Results info */}
      <div className="text-center text-sm text-gray-600">
        পৃষ্ঠা {currentPage} / {totalPages} • মোট {products.length} টি পণ্য
      </div>
    </div>
  );
}
