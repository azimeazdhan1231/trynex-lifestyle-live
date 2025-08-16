import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            TryneX Lifestyle
          </h2>
          <p className="text-gray-600 dark:text-gray-300">লোড হচ্ছে...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;