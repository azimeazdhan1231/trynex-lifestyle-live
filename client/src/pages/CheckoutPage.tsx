import Layout from "@/components/Layout";
import PerfectCheckoutPage from "@/components/PerfectCheckoutPage";
import { useCart } from "@/hooks/use-cart";
import { Redirect, useLocation } from "wouter";

const CheckoutPage = () => {
  const { items } = useCart();
  const [, navigate] = useLocation();

  // Redirect to cart if no items
  if (items.length === 0) {
    return <Redirect to="/cart" />;
  }

  const handleSuccess = (orderId: string) => {
    navigate(`/tracking/${orderId}`);
  };

  const handleBack = () => {
    navigate("/cart");
  };

  return (
    <Layout>
      <PerfectCheckoutPage onSuccess={handleSuccess} onBack={handleBack} />
    </Layout>
  );
};

export default CheckoutPage;