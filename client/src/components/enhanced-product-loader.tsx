import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Package, ShoppingBag } from "lucide-react";

// Enhanced Product Loading Skeleton with smooth animations
function EnhancedProductSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
    >
      {/* Image skeleton with gradient animation */}
      <div className="aspect-[4/5] relative bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
        
        {/* Floating icon animation */}
        <motion.div 
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        
        {/* Corner sparkle effect */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-3 right-3"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </motion.div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer"></div>
          </div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full w-2/3 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer"></div>
          </div>
        </div>

        {/* Price and button skeleton */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-full w-20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer"></div>
          </div>
          <div className="h-8 bg-gradient-to-r from-green-200 via-green-100 to-green-200 rounded-full w-24 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <motion.div 
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          delay: index * 0.5
        }}
        className="absolute top-2 left-2 w-2 h-2 bg-blue-400 rounded-full"
      />
      <motion.div 
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          delay: index * 0.5 + 1
        }}
        className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-green-400 rounded-full"
      />
    </motion.div>
  );
}

// Main loading screen with Bengali text and enhanced UX
export default function EnhancedProductLoader({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-8">
      {/* Header with animated Bengali text */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-8"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-lg border border-blue-100"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">পণ্য লোড হচ্ছে...</h3>
            <p className="text-sm text-gray-600">সেরা পণ্যগুলি আনা হচ্ছে</p>
          </div>
          <motion.div
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </motion.div>
        </motion.div>

        {/* Loading progress indicator */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="max-w-xs mx-auto mt-6"
        >
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Products grid with staggered animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        {Array.from({ length: count }).map((_, index) => (
          <EnhancedProductSkeleton key={index} index={index} />
        ))}
      </motion.div>

      {/* Bottom floating message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-center"
      >
        <motion.p 
          animate={{ 
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-gray-500 text-sm font-medium"
        >
          প্রিমিয়াম কোয়ালিটির পণ্য আনছি আপনার জন্য...
        </motion.p>
      </motion.div>
    </div>
  );
}

// CSS for shimmer effect - add to global styles if needed
export const shimmerStyles = `
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;