import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "w-[90vw] max-w-sm sm:max-w-md",
  md: "w-[95vw] max-w-lg sm:max-w-xl lg:max-w-2xl",
  lg: "w-[95vw] max-w-xl sm:max-w-2xl lg:max-w-4xl",
  xl: "w-[95vw] max-w-2xl sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl",
  full: "w-[98vw] max-w-none sm:max-w-7xl"
};

export default function ResponsiveModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children,
  size = 'md',
  showCloseButton = false 
}: ResponsiveModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-4 lg:m-6`}
        data-testid="responsive-modal"
      >
        <DialogHeader className="flex-shrink-0 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-2 p-1 h-8 w-8 rounded-full hover:bg-gray-100"
                data-testid="modal-close-button"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}