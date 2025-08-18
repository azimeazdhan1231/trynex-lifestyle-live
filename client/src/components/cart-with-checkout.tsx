import { useState } from "react";
import SimpleCartModal from "./simple-cart-modal";
import CheckoutModal from "./checkout-modal";
import EnhancedOrderSuccessModal from "./enhanced-order-success-modal";

interface CartWithCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartWithCheckout({ isOpen, onClose }: CartWithCheckoutProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleOrderComplete = (orderData: any) => {
    // Use the actual order data from checkout instead of mock data
    const orderDetails = {
      tracking_id: orderData.tracking_id || orderData.orderId || `TRX-${Date.now()}`,
      customer_name: orderData.customer_name || orderData.customerName || "গ্রাহক",
      phone: orderData.phone || orderData.customerPhone || "01XXXXXXXXX",
      total: orderData.total || orderData.totalAmount || "0",
      items: orderData.items || [],
      address: orderData.address || orderData.customerAddress,
      district: orderData.district,
      thana: orderData.thana
    };
    
    setOrderDetails(orderDetails);
    setShowOrderSuccess(true);
    setShowCheckout(false);
  };

  const handleCloseAll = () => {
    setShowCheckout(false);
    setShowOrderSuccess(false);
    onClose();
  };

  return (
    <>
      <SimpleCartModal 
        isOpen={isOpen && !showCheckout && !showOrderSuccess} 
        onClose={onClose}
        onCheckout={handleCheckout}
      />
      
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onOrderComplete={handleOrderComplete}
      />
      
      {orderDetails && (
        <EnhancedOrderSuccessModal
          isOpen={showOrderSuccess}
          onClose={handleCloseAll}
          orderDetails={orderDetails}
        />
      )}
    </>
  );
}