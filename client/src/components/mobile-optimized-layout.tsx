import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import EnhancedHeader from './enhanced-header';
import EnhancedFooter from './enhanced-footer';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  showScrollTop?: boolean;
}

export default function MobileOptimizedLayout({ 
  children, 
  showScrollTop = true 
}: MobileOptimizedLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };

    checkMobile();
    handleScroll();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);

    // Add mobile optimization class
    document.body.classList.add('mobile-optimized');

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('mobile-optimized');
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 prevent-overflow">
      <EnhancedHeader />
      
      <main className="pt-24 lg:pt-32">
        {children}
      </main>

      <EnhancedFooter />

      {/* Mobile-optimized Scroll to Top Button */}
      {showScrollTop && isScrolled && (
        <Button
          onClick={scrollToTop}
          className={`fixed z-50 shadow-2xl bg-primary hover:bg-primary/80 transform hover:scale-110 transition-all duration-300 ${
            isMobile 
              ? 'bottom-6 right-4 w-14 h-14 rounded-full' 
              : 'bottom-8 right-8 w-16 h-16 rounded-full'
          }`}
          size={isMobile ? "sm" : "lg"}
          aria-label="উপরে যান"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}


    </div>
  );
}