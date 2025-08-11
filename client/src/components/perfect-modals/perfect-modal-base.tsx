import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  maxWidth = "max-w-md",
  className = ""
}: PerfectModalBaseProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          ${maxWidth} 
          max-h-[90vh] 
          w-[95vw] 
          p-0 
          gap-0 
          overflow-hidden 
          border-0 
          shadow-2xl 
          ${className}
        `}
        aria-describedby="modal-description"
      >
        {/* Fixed Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
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
        <div className="overflow-y-auto max-h-[calc(90vh-64px)] flex flex-col">
          {children}
        </div>
        
        {/* Hidden description for accessibility */}
        <div id="modal-description" className="sr-only">
          Modal content
        </div>
      </DialogContent>
    </Dialog>
  );
}