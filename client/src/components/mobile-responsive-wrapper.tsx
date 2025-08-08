import { useEffect, useState } from 'react';

interface MobileResponsiveWrapperProps {
  children: React.ReactNode;
}

export default function MobileResponsiveWrapper({ children }: MobileResponsiveWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      if (width < 480) setScreenSize('xs');
      else if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else setScreenSize('xl');
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Apply mobile-specific CSS classes
  useEffect(() => {
    const body = document.body;
    
    if (isMobile) {
      body.classList.add('mobile-optimized');
    } else {
      body.classList.remove('mobile-optimized');
    }
    
    // Add screen size class
    body.className = body.className.replace(/screen-(xs|sm|md|lg|xl)/g, '');
    body.classList.add(`screen-${screenSize}`);
    
    return () => {
      body.classList.remove('mobile-optimized');
      body.className = body.className.replace(/screen-(xs|sm|md|lg|xl)/g, '');
    };
  }, [isMobile, screenSize]);

  return <>{children}</>;
}