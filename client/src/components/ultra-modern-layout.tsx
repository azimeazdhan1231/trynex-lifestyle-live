import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import ModernFooter from './modern-footer';

interface UltraModernLayoutProps {
  children: React.ReactNode;
  showScrollTop?: boolean;
  showWhatsApp?: boolean;
}

export default function UltraModernLayout({ 
  children, 
  showScrollTop = true,
  showWhatsApp = true
}: UltraModernLayoutProps) {
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

    // Add optimization classes
    document.body.classList.add('ultra-modern-optimized');

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('ultra-modern-optimized');
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  const openWhatsApp = () => {
    const phoneNumber = '8801234567890'; // Update with actual WhatsApp number
    const message = 'নমস্কার! আমি TryneX Lifestyle থেকে কিছু জানতে চাই।';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 ultra-modern-container">
      <Header />
      
      <main className="pt-[140px] lg:pt-[180px]">
        {children}
      </main>

      <ModernFooter />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
        
        {/* WhatsApp Button */}
        {showWhatsApp && (
          <Button
            onClick={openWhatsApp}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
            size="sm"
            aria-label="WhatsApp এ চ্যাট করুন"
            data-testid="button-whatsapp"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && isScrolled && (
          <Button
            onClick={scrollToTop}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
            size="sm"
            aria-label="উপরে যান"
            data-testid="button-scroll-top"
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
        )}
      </div>


    </div>
  );
}