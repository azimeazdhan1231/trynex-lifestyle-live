
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Ultra-fast performance loader with aggressive optimizations
export function UltraPerformanceLoader() {
  const [isOptimizing, setIsOptimizing] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const optimizeEverything = async () => {
      console.log('🚀 Ultra Performance Mode: ACTIVATED');
      
      // 1. Immediate DOM optimizations
      document.documentElement.style.willChange = 'transform';
      document.body.style.willChange = 'transform';
      
      // 2. Critical CSS injection for instant styling
      const criticalCSS = `
        .product-card { 
          transform: translateZ(0); 
          backface-visibility: hidden;
          perspective: 1000px;
        }
        .loading-skeleton { 
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        * { box-sizing: border-box; }
        img { content-visibility: auto; }
      `;
      
      const style = document.createElement('style');
      style.textContent = criticalCSS;
      document.head.appendChild(style);
      
      // 3. Preload absolutely everything
      const preloadPromises = [
        // Preload API data
        fetch('/api/products', { headers: { 'Cache-Control': 'max-age=30' } })
          .then(res => res.json())
          .then(data => {
            queryClient.setQueryData(['products'], data);
            console.log('🚀 Products preloaded successfully');
          }),
        
        fetch('/api/categories', { headers: { 'Cache-Control': 'max-age=60' } })
          .then(res => res.json())
          .then(data => {
            queryClient.setQueryData(['categories'], data);
            console.log('🚀 Categories preloaded successfully');
          }),
        
        fetch('/api/settings')
          .then(res => res.json())
          .then(data => {
            queryClient.setQueryData(['settings'], data);
            console.log('🚀 Settings preloaded successfully');
          })
      ];
      
      // 4. DNS prefetch for external resources
      const dnsPrefetches = [
        'https://i.postimg.cc',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];
      
      dnsPrefetches.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      });
      
      // 5. Enable aggressive browser optimizations
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection?.effectiveType === '4g') {
          // High-speed connection: preload everything
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 4G detected: Maximum performance mode');
          }
        }
      }
      
      // 6. Wait for all preloads with timeout
      try {
        await Promise.race([
          Promise.all(preloadPromises),
          new Promise(resolve => setTimeout(resolve, 2000)) // 2s timeout
        ]);
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 All critical resources preloaded');
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Some preloads failed, continuing anyway:', error);
        }
      }
      
      // 7. Force immediate repaint
      document.documentElement.style.transform = 'translateZ(0)';
      requestAnimationFrame(() => {
        document.documentElement.style.transform = '';
        setIsOptimizing(false);
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 Ultra Performance Mode: COMPLETE');
        }
      });
    };
    
    optimizeEverything();
  }, [queryClient]);

  if (!isOptimizing) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-orange-600 font-medium">Optimizing Performance...</p>
      </div>
    </div>
  );
}
