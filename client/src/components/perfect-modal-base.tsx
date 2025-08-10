import { ReactNode } from "react";
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

interface PerfectModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  showCloseButton?: boolean;
  className?: string;
}

export default function PerfectModalBase({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "2xl",
  showCloseButton = true,
  className = ""
}: PerfectModalBaseProps) {
  
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          ${maxWidthClasses[maxWidth]} 
          w-[95vw] 
          max-h-[90vh] 
          overflow-y-auto 
          p-0 
          gap-0 
          rounded-2xl 
          border-2 
          border-gray-200 
          shadow-2xl 
          bg-white
          ${className}
        `}
        aria-describedby={description ? "modal-description" : undefined}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription id="modal-description" className="text-sm text-gray-600">
                  {description}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={onClose}
                  data-testid="button-close-modal"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">বন্ধ করুন</span>
                </Button>
              </DialogClose>
            )}
          </div>
        </DialogHeader>
        
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}