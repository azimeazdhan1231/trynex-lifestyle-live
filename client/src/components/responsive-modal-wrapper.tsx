
import { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResponsiveModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  fullScreen?: boolean;
}

export default function ResponsiveModalWrapper({
  isOpen,
  onClose,
  children,
  className,
  maxWidth = 'lg',
  fullScreen = false
}: ResponsiveModalWrapperProps) {
  const maxWidthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg md:max-w-xl lg:max-w-2xl',
    xl: 'sm:max-w-xl md:max-w-2xl lg:max-w-3xl',
    '2xl': 'sm:max-w-2xl md:max-w-3xl lg:max-w-4xl',
    '4xl': 'sm:max-w-4xl md:max-w-5xl lg:max-w-6xl',
    '6xl': 'sm:max-w-6xl md:max-w-7xl'
  }[maxWidth];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 overflow-hidden",
          // Perfect mobile responsiveness
          "w-[95vw] max-h-[90vh]",
          // Perfect desktop responsiveness
          "sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw]",
          maxWidthClass,
          // Full screen option
          fullScreen && "w-[98vw] h-[95vh] max-w-none max-h-none sm:w-[95vw] sm:h-[90vh]",
          // Perfect positioning (handled by DialogContent now)
          // Smooth animations
          "animate-in fade-in-0 zoom-in-95 duration-200",
          // Professional styling
          "border-0 shadow-2xl rounded-xl",
          "bg-white dark:bg-gray-900",
          className
        )}
        onInteractOutside={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <div className="flex flex-col h-full max-h-[inherit] overflow-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
