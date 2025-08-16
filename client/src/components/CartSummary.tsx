import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import { ShoppingCart, Truck, Shield } from "lucide-react";

const CartSummary = () => {
  const { items, getTotalPrice, getTotalItems } = useCart();
  
  const subtotal = getTotalPrice();
  const deliveryFee = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryFee;
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 sticky top-4">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <ShoppingCart className="w-5 h-5 mr-2" />
        অর্ডার সামারি
      </h3>

      <div className="space-y-4">
        {/* Items Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>পণ্য ({totalItems} টি)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <Truck className="w-4 h-4 mr-1" />
              ডেলিভারি চার্জ
            </span>
            <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
              {deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}
            </span>
          </div>

          {subtotal < 500 && (
            <p className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
              আরো {formatPrice(500 - subtotal)} কেনাকাটা করলে ফ্রি ডেলিভারি পাবেন!
            </p>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>মোট</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>

        {/* Checkout Button */}
        <Link href="/checkout">
          <Button className="w-full" size="lg" data-testid="checkout-button">
            চেকআউট করুন
          </Button>
        </Link>

        {/* Continue Shopping */}
        <Link href="/products">
          <Button variant="outline" className="w-full">
            আরো কেনাকাটা করুন
          </Button>
        </Link>

        {/* Security Info */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-4">
          <Shield className="w-4 h-4" />
          <span>নিরাপদ এবং সুরক্ষিত পেমেন্ট</span>
        </div>

        {/* Features */}
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            ক্যাশ অন ডেলিভারি
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            ৭ দিনের রিটার্ন পলিসি
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            ২৪/৭ কাস্টমার সাপোর্ট
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CartSummary;