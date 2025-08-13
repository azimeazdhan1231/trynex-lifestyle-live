import React from 'react';
import type { Product } from '@shared/schema';

interface PerfectProductGridProps {
  children: React.ReactNode;
  className?: string;
}

interface PerfectProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onCustomize: (product: Product) => void;
  children: React.ReactNode;
}

// Perfect Grid Container with responsive breakpoints
export function PerfectProductGrid({ children, className = '' }: PerfectProductGridProps) {
  return (
    <div className={`
      perfect-product-grid
      grid gap-4 sm:gap-6
      grid-cols-2 
      sm:grid-cols-2 
      md:grid-cols-3 
      lg:grid-cols-4 
      xl:grid-cols-5
      2xl:grid-cols-6
      auto-rows-fr
      ${className}
    `}>
      {children}
    </div>
  );
}

// Perfect Product Card Wrapper that ensures consistent sizing
export function PerfectProductCardWrapper({ children }: PerfectProductCardProps) {
  return (
    <div className="perfect-product-card-wrapper h-full flex flex-col">
      {children}
    </div>
  );
}

export default PerfectProductGrid;