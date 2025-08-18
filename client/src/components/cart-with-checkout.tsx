import { useState } from "react";
import SimpleCartModal from "./simple-cart-modal";
import CheckoutModal from "./checkout-modal";
import OrderSuccessModal from "./order-success-modal";

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

  const handleOrderComplete = (trackingId: string) => {
    // This would typically get order details from the API response
    // For now, we'll create mock details based on the tracking ID
    const mockOrderDetails = {
      tracking_id: trackingId,
      customer_name: "গ্রাহক", // This should come from the checkout form
      phone: "01XXXXXXXXX", // This should come from the checkout form  
      total: "0", // This should come from cart total
      items: [] // This should come from cart items
    };
    
    setOrderDetails(mockOrderDetails);
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
        <OrderSuccessModal
          isOpen={showOrderSuccess}
          onClose={handleCloseAll}
          orderDetails={orderDetails}
        />
      )}
    </>
  );
}