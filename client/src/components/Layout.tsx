import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showScrollTop?: boolean;
  className?: string;
}

const Layout = ({ children, showScrollTop = true, className = "" }: LayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
      setShowScrollTopButton(scrollPosition > 500);
    };

    checkMobile();
    handleScroll();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);

    // Prevent overscroll behavior on mobile
    document.body.style.overscrollBehavior = 'none';

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${className}`}>
      <Header />
      
      <main className="pt-24 lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <Footer />
      
      {/* Mobile Navigation */}
      
      {/* Floating Action Buttons */}

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && showScrollTopButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50"
          >
            <Button
              onClick={scrollToTop}
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 border-2 border-white dark:border-gray-800 transform hover:scale-110 transition-all duration-300"
              size="icon"
              aria-label="উপরে যান"
              data-testid="scroll-to-top"
            >
              <ArrowUp className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;