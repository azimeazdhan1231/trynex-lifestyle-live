import { useCart } from "@/hooks/use-cart";
import LiveOrderTracking from "@/components/live-order-tracking";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";

export default function TrackingPageEnhanced() {
  const { totalItems } = useCart();

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">অর্ডার ট্র্যাকিং</h1>
            <p className="text-gray-600">আপনার অর্ডারের বর্তমান অবস্থা জানুন</p>
            {totalItems > 0 && (
              <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                <p className="text-orange-800">
                  আপনার কার্টে {totalItems}টি পণ্য রয়েছে। 
                  <a href="/cart" className="font-semibold underline ml-2">চেকআউট করুন</a>
                </p>
              </div>
            )}
          </div>

          {/* Live Order Tracking Component */}
          <LiveOrderTracking autoRefresh={true} />
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}