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
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl'
  }[maxWidth];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 overflow-hidden",
          "w-[95vw] max-h-[90vh]", // Mobile responsive
          "sm:w-full", // Desktop responsive
          maxWidthClass,
          fullScreen && "w-screen h-screen max-w-none max-h-none",
          // Perfect desktop positioning
          "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
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