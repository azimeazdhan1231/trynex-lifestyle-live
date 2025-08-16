import Layout from "@/components/Layout";
import CartItems from "@/components/CartItems";
import CartSummary from "@/components/CartSummary";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const CartPage = () => {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">আপনার কার্ট খালি</h2>
            <p className="text-gray-600 mb-6">
              কেনাকাটা শুরু করতে কিছু পণ্য যোগ করুন
            </p>
            <Link href="/products">
              <Button size="lg">কেনাকাটা শুরু করুন</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">আপনার কার্ট</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;