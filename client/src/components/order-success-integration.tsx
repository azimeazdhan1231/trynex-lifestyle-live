import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import EnhancedOrderSuccessModal from "./enhanced-order-success-modal";

interface OrderSuccessIntegrationProps {
  children: (props: {
    showOrderSuccess: (orderDetails: any) => void;
    OrderSuccessModal: React.ComponentType<any>;
  }) => React.ReactNode;
}

export default function OrderSuccessIntegration({ children }: OrderSuccessIntegrationProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const { toast } = useToast();

  const showOrderSuccess = (orderData: any) => {
    // Normalize order data structure
    const normalizedOrderDetails = {
      tracking_id: orderData.tracking_id || orderData.orderId || orderData.id || `TRX-${Date.now()}`,
      customer_name: orderData.customer_name || orderData.customerName || orderData.name || "গ্রাহক",
      phone: orderData.phone || orderData.customerPhone || orderData.mobile || "01XXXXXXXXX",
      total: orderData.total || orderData.totalAmount || orderData.amount || "0",
      items: orderData.items || orderData.products || [],
      address: orderData.address || orderData.customerAddress || orderData.shippingAddress,
      district: orderData.district,
      thana: orderData.thana
    };

    setOrderDetails(normalizedOrderDetails);
    setShowSuccess(true);

    // Also show a brief toast for immediate feedback
    toast({
      title: "🎉 অর্ডার সফল!",
      description: "বিস্তারিত দেখার জন্য অর্ডার সফল মোডালটি দেখুন",
      duration: 3000,
    });
  };

  const OrderSuccessModal = () => {
    if (!orderDetails || !showSuccess) return null;

    return (
      <EnhancedOrderSuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          setOrderDetails(null);
        }}
        orderDetails={orderDetails}
      />
    );
  };

  return (
    <>
      {children({ showOrderSuccess, OrderSuccessModal })}
      <OrderSuccessModal />
    </>
  );
}