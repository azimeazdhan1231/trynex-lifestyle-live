import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { createWhatsAppUrl } from "@/lib/constants";
import {
  MessageCircle,
  Phone,
  Mail,
  X,
  Plus,
  Headphones
} from "lucide-react";

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contactActions = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: createWhatsAppUrl("", "হ্যালো! আমার একটি প্রশ্ন আছে।"),
      color: "bg-green-500 hover:bg-green-600",
      testId: "fab-whatsapp"
    },
    {
      icon: Phone,
      label: "ফোন",
      href: "tel:+8801234567890",
      color: "bg-blue-500 hover:bg-blue-600",
      testId: "fab-phone"
    },
    {
      icon: Mail,
      label: "ইমেইল",
      href: "mailto:info@trynexlifestyle.com",
      color: "bg-purple-500 hover:bg-purple-600",
      testId: "fab-email"
    }
  ];

  return (
    <div className="fixed bottom-20 lg:bottom-8 left-4 lg:left-8 z-50">
      <div className="relative">
        {/* Action Buttons */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 left-0 space-y-3"
            >
              {contactActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
                    {action.label}
                  </span>
                  <motion.a
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    data-testid={action.testId}
                  >
                    <Button
                      size="icon"
                      className={`w-12 h-12 rounded-full shadow-lg border-2 border-white dark:border-gray-800 ${action.color}`}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </Button>
                  </motion.a>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 border-2 border-white dark:border-gray-800 transition-all duration-300 ${
              isOpen ? 'rotate-45' : 'rotate-0'
            }`}
            size="icon"
            data-testid="fab-main"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Headphones className="w-6 h-6 text-white" />
            )}
          </Button>
        </motion.div>

        {/* Pulse Animation */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FloatingActionButton;