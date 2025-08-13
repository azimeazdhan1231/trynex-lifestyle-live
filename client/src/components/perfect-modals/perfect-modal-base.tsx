import React from "react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PerfectModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
  className?: string;
}

export default function PerfectModalBase({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-2xl",
  className = ""
}: PerfectModalBaseProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          ${maxWidth} 
          h-[96vh] 
          max-h-[96vh] 
          w-[96vw] 
          sm:w-[92vw] 
          md:w-[88vw] 
          lg:w-[85vw] 
          xl:w-[82vw] 
          p-0 
          gap-0 
          overflow-hidden 
          border-0 
          shadow-2xl 
          rounded-lg 
          sm:rounded-xl 
          md:rounded-2xl 
          ${className}
        `}
        aria-describedby="modal-description"
      >
        {/* Fixed Header */}
        {title && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b bg-white sticky top-0 z-10">
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(96vh-80px)] flex flex-col flex-1 scrollbar-hide">
          {children}
        </div>
        
        {/* Hidden description for accessibility */}
        <DialogDescription className="sr-only">
          Modal content
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}