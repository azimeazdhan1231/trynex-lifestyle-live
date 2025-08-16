import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

const CartItems = () => {
  const { items, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">আপনার কার্ট খালি</h3>
        <p className="text-gray-600">কেনাকাটা শুরু করতে কিছু পণ্য যোগ করুন</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">কার্ট আইটেম ({items.length})</h2>
      
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPrice(item.price)} প্রতি পিস
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-8 w-8"
                    data-testid={`decrease-quantity-${item.id}`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <span className="w-12 text-center font-medium" data-testid={`quantity-${item.id}`}>
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8"
                    data-testid={`increase-quantity-${item.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  data-testid={`remove-item-${item.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CartItems;