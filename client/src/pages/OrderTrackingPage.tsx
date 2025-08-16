import Layout from "@/components/Layout";
import OrderTracking from "@/components/OrderTracking";

const OrderTrackingPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">অর্ডার ট্র্যাকিং</h1>
        <OrderTracking />
      </div>
    </Layout>
  );
};

export default OrderTrackingPage;