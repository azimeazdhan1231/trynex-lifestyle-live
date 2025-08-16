import Layout from "@/components/Layout";
import CheckoutForm from "@/components/CheckoutForm";
import OrderSummary from "@/components/OrderSummary";
import { useCart } from "@/hooks/use-cart";
import { Navigate } from "wouter";

const CheckoutPage = () => {
  const { items } = useCart();

  // Redirect to cart if no items
  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">চেকআউট</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <CheckoutForm />
          </div>
          <div>
            <OrderSummary />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;