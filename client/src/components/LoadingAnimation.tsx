import { motion } from "framer-motion";

interface LoadingAnimationProps {
  message?: string;
  className?: string;
}

const LoadingAnimation = ({ message = "লোড হচ্ছে...", className = "" }: LoadingAnimationProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <motion.div
        className="relative w-16 h-16 mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-green-500 rounded-full"></div>
        <motion.div
          className="absolute inset-2 border-4 border-transparent border-b-yellow-500 border-l-red-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        ></motion.div>
      </motion.div>
      
      <motion.p
        className="text-gray-600 text-sm font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>
      
      <motion.div
        className="flex space-x-1 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default LoadingAnimation;