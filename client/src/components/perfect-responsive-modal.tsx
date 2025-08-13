import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PerfectResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  enableScroll?: boolean;
}

export default function PerfectResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "2xl",
  className = "",
  showCloseButton = true,
  closeOnBackdropClick = true,
  enableScroll = true
}: PerfectResponsiveModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getMaxWidthClass = () => {
    if (isMobile) return 'w-full mx-4';
    
    switch (maxWidth) {
      case "sm": return "max-w-sm w-full";
      case "md": return "max-w-md w-full";
      case "lg": return "max-w-lg w-full";
      case "xl": return "max-w-xl w-full";
      case "2xl": return "max-w-2xl w-full";
      case "3xl": return "max-w-3xl w-full";
      case "4xl": return "max-w-4xl w-full";
      case "5xl": return "max-w-5xl w-full";
      case "6xl": return "max-w-6xl w-full";
      case "7xl": return "max-w-7xl w-full";
      case "full": return "w-full mx-4";
      default: return "max-w-2xl w-full";
    }
  };

  const getHeightClass = () => {
    if (isMobile) {
      return 'max-h-[100vh] h-full';
    }
    return 'max-h-[95vh]';
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: isMobile ? 1 : 0.95,
              y: isMobile ? '100%' : 0
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: isMobile ? 1 : 0.95,
              y: isMobile ? '100%' : 0
            }}
            transition={{ 
              duration: 0.2,
              ease: "easeOut"
            }}
            className={`relative bg-white rounded-t-2xl md:rounded-2xl shadow-2xl ${getMaxWidthClass()} ${getHeightClass()} ${
              isMobile ? 'rounded-b-none' : ''
            } ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-4 h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div 
              className={`flex-1 ${enableScroll ? 'overflow-y-auto' : 'overflow-hidden'} ${
                title || showCloseButton ? '' : 'pt-4 md:pt-6'
              }`}
              style={{ 
                maxHeight: `calc(${getHeightClass()} - ${title || showCloseButton ? '80px' : '0px'})` 
              }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}