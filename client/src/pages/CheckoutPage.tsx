import Layout from "@/components/Layout";
import PerfectCheckoutPage from "@/components/PerfectCheckoutPage";
import { useCart } from "@/hooks/use-cart";
import { Redirect } from "wouter";

const CheckoutPage = () => {
  const { items } = useCart();

  // Redirect to cart if no items
  if (items.length === 0) {
    return <Redirect to="/cart" />;
  }

  return (
    <Layout>
      <PerfectCheckoutPage />
    </Layout>
  );
};

export default CheckoutPage;