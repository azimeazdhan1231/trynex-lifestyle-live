import { ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  className?: string;
  preventClose?: boolean;
}

export default function DynamicResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "lg",
  showCloseButton = true,
  className = "",
  preventClose = false
}: DynamicResponsiveModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClose = () => {
    if (!preventClose) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    if (isMobile) {
      return "w-[100vw] h-[100vh] max-w-none max-h-none rounded-none m-0";
    }

    const sizeMap = {
      sm: "max-w-md w-[90vw]",
      md: "max-w-lg w-[90vw]", 
      lg: "max-w-2xl w-[90vw]",
      xl: "max-w-4xl w-[90vw]",
      full: "max-w-6xl w-[95vw]"
    };

    return sizeMap[size];
  };

  const getHeightClasses = () => {
    if (isMobile) {
      return "h-[100vh]";
    }
    return "max-h-[85vh]";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={cn(
          // Base styles
          "p-0 gap-0 overflow-hidden border-0 shadow-2xl",
          
          // Responsive sizing
          getSizeClasses(),
          getHeightClasses(),
          
          // Mobile full-screen styles
          isMobile && "fixed inset-0 translate-x-0 translate-y-0",
          
          // Desktop centering
          !isMobile && "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
          
          // Background and styling
          "bg-gray-900 text-white border-gray-700",
          isMobile ? "rounded-none" : "rounded-xl",
          
          // Animations
          !isMobile && "animate-in fade-in-0 zoom-in-95 duration-200",
          isMobile && "animate-in slide-in-from-bottom duration-300",
          
          className
        )}
        onInteractOutside={(e) => {
          if (!preventClose) {
            e.preventDefault();
            onClose();
          }
        }}
      >
        {/* Header */}
        <DialogHeader 
          className={cn(
            "px-4 py-4 border-b border-gray-600 bg-gray-800/50",
            isMobile ? "px-4 py-3" : "px-6 py-4",
            isMobile ? "rounded-none" : "rounded-t-xl"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle 
                className={cn(
                  "font-bold text-gray-900 dark:text-white mb-1 truncate",
                  isMobile ? "text-lg" : "text-xl sm:text-2xl"
                )}
              >
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription 
                  className={cn(
                    "text-gray-600 dark:text-gray-300",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  {description}
                </DialogDescription>
              )}
            </div>
            
            {showCloseButton && !preventClose && (
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full hover:bg-gray-200 transition-colors shrink-0 ml-2",
                    isMobile ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
                  )}
                  onClick={onClose}
                  data-testid="button-close-modal"
                >
                  <X className={cn("text-gray-500", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  <span className="sr-only">বন্ধ করুন</span>
                </Button>
              </DialogClose>
            )}
          </div>
        </DialogHeader>
        
        {/* Content */}
        <div 
          className={cn(
            "overflow-y-auto",
            isMobile 
              ? "px-4 py-4 h-[calc(100vh-80px)]" 
              : "px-6 py-4 max-h-[calc(85vh-100px)]"
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}