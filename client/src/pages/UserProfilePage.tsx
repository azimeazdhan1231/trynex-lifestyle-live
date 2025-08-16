import Layout from "@/components/Layout";
import UserProfile from "@/components/UserProfile";
import OrderHistory from "@/components/OrderHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserProfilePage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">আমার একাউন্ট</h1>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">প্রোফাইল</TabsTrigger>
            <TabsTrigger value="orders">অর্ডার</TabsTrigger>
            <TabsTrigger value="wishlist">উইশলিস্ট</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-6">
            <UserProfile />
          </TabsContent>
          <TabsContent value="orders" className="space-y-6">
            <OrderHistory />
          </TabsContent>
          <TabsContent value="wishlist" className="space-y-6">
            <div className="text-center py-8">
              <p>উইশলিস্ট ফিচার শীঘ্রই আসছে</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfilePage;