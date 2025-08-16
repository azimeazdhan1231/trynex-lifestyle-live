import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import { Package, Truck, Shield } from "lucide-react";

const OrderSummary = () => {
  const { items, getTotalPrice, getTotalItems } = useCart();
  
  const subtotal = getTotalPrice();
  const deliveryFee = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryFee;
  const totalItems = getTotalItems();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          অর্ডার সামারি
        </h3>

        {/* Items List */}
        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-400">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
              </div>
              <p className="font-semibold">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>সাবটোটাল ({totalItems} টি পণ্য)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
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

        <Separator className="my-4" />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>সর্বমোট</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </Card>

      {/* Security & Features */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <Shield className="w-4 h-4 text-green-500" />
            <span>নিরাপদ এবং সুরক্ষিত অর্ডার</span>
          </div>
          
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              ৭ দিনের রিটার্ন গ্যারান্টি
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              ২৪/৭ কাস্টমার সাপোর্ট
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              দ্রুত ডেলিভারি সার্ভিস
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderSummary;